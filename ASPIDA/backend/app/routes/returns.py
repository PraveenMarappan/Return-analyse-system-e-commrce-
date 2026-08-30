from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.models import Return, ReturnAnalysis, Product, db
from app.services.nlp_service import NLPService
from app.services.sentiment_service import SentimentService

returns_bp = Blueprint('returns', __name__)

@returns_bp.route('', methods=['GET'])
@jwt_required()
def get_returns():
    search = request.args.get('search', '').strip()
    category = request.args.get('category')
    reason = request.args.get('reason')
    sentiment = request.args.get('sentiment')
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Return.query.join(Product)

    if search:
        query = query.filter(
            (Return.customer_comment.ilike(f'%{search}%')) |
            (Product.name.ilike(f'%{search}%')) |
            (Product.sku.ilike(f'%{search}%')) |
            (Return.return_reason.ilike(f'%{search}%'))
        )

    if category and category != 'All':
        query = query.filter(Product.category == category)

    if reason and reason != 'All':
        query = query.filter(Return.return_reason == reason)

    if status and status != 'All':
        query = query.filter(Return.status == status)

    if sentiment and sentiment != 'All':
        query = query.join(ReturnAnalysis).filter(ReturnAnalysis.sentiment == sentiment)

    query = query.order_by(Return.id.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "data": {
            "returns": [r.to_dict() for r in paginated.items],
            "total": paginated.total,
            "page": paginated.page,
            "pages": paginated.pages,
            "per_page": paginated.per_page
        }
    }), 200


@returns_bp.route('/<int:return_id>', methods=['GET'])
@jwt_required()
def get_return(return_id):
    r = Return.query.get(return_id)
    if not r:
        return jsonify({"success": False, "message": "Return record not found."}), 404
    return jsonify({"success": True, "data": r.to_dict()}), 200


@returns_bp.route('', methods=['POST'])
@jwt_required()
def create_return():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    comment = data.get('customer_comment', '').strip()
    reason = data.get('return_reason', 'Other')
    purchase_price = data.get('purchase_price')
    image_path = data.get('image_path')
    damage_assessment = data.get('damage_assessment', 'No obvious damage')
    damage_score = data.get('damage_score', 0.0)

    if not product_id or not comment:
        return jsonify({"success": False, "message": "Product ID and customer comment are required."}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404

    price = float(purchase_price) if purchase_price else product.price

    new_return = Return(
        product_id=product_id,
        customer_comment=comment,
        return_reason=reason,
        purchase_date=datetime.now().date(),
        return_date=datetime.now().date(),
        purchase_price=price,
        image_path=image_path,
        status='Processed'
    )
    db.session.add(new_return)
    db.session.flush()  # get new_return.id

    # Run AI Analysis Pipeline
    nlp_res = NLPService.classify_return_reason(comment, user_selected_reason=reason)
    sent_res = SentimentService.analyze_sentiment(comment)

    analysis = ReturnAnalysis(
        return_id=new_return.id,
        primary_reason=nlp_res['primary_reason'],
        secondary_reason=nlp_res['secondary_reason'],
        sentiment=sent_res['sentiment'],
        sentiment_score=sent_res['sentiment_score'],
        root_cause=nlp_res['root_cause'],
        urgency=nlp_res['urgency'],
        confidence=nlp_res['confidence'],
        recommendation=nlp_res['explanation'],
        damage_assessment=damage_assessment,
        damage_score=damage_score
    )
    db.session.add(analysis)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Return record created and analyzed successfully.",
        "data": new_return.to_dict()
    }), 201


@returns_bp.route('/<int:return_id>', methods=['DELETE'])
@jwt_required()
def delete_return(return_id):
    r = Return.query.get(return_id)
    if not r:
        return jsonify({"success": False, "message": "Return record not found."}), 404

    db.session.delete(r)
    db.session.commit()
    return jsonify({"success": True, "message": "Return record deleted successfully."}), 200
