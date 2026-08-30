from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Product, Return, db
from app.services.risk_service import RiskService
from app.services.recommendation_service import RecommendationService

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    search = request.args.get('search', '').strip()
    category = request.args.get('category')
    
    query = Product.query

    if search:
        query = query.filter((Product.name.ilike(f'%{search}%')) | (Product.sku.ilike(f'%{search}%')))

    if category and category != 'All':
        query = query.filter(Product.category == category)

    products = query.all()
    
    results = []
    for p in products:
        p_dict = p.to_dict()
        risk_info = RiskService.calculate_product_risk(p.id)
        if risk_info:
            p_dict.update({
                'risk_score': risk_info['risk_score'],
                'health_score': risk_info['health_score'],
                'status': risk_info['status'],
                'return_rate': risk_info['return_rate'],
                'total_returns': risk_info['total_returns'],
                'negative_sentiment_pct': risk_info['negative_sentiment_pct'],
                'top_complaint': risk_info['top_complaint'],
                'trend': risk_info['trend']
            })
        results.append(p_dict)

    # Sort by risk score descending
    results.sort(key=lambda x: x.get('risk_score', 0), reverse=True)

    return jsonify({"success": True, "data": results}), 200


@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product_detail(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404

    p_dict = product.to_dict()
    risk_info = RiskService.calculate_product_risk(product_id)
    if risk_info:
        p_dict.update(risk_info)

    # Get product specific recommendations
    all_recs = RecommendationService.generate_recommendations()
    p_recs = [r for r in all_recs if r['product_id'] == product_id or r['product_name'] == product.name]

    # Get recent returns for this product
    returns = Return.query.filter_by(product_id=product_id).order_by(Return.id.desc()).limit(10).all()
    
    p_dict['recommendations'] = p_recs
    p_dict['recent_returns'] = [r.to_dict() for r in returns]

    return jsonify({"success": True, "data": p_dict}), 200


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    sku = data.get('sku', '').strip().upper()
    category = data.get('category', '').strip()
    price = data.get('price')
    description = data.get('description', '')
    total_orders = data.get('total_orders', 1000)

    if not name or not sku or not category or not price:
        return jsonify({"success": False, "message": "Name, SKU, category, and price are required."}), 400

    if Product.query.filter_by(sku=sku).first():
        return jsonify({"success": False, "message": "Product with this SKU already exists."}), 400

    product = Product(
        name=name,
        sku=sku,
        category=category,
        price=float(price),
        description=description,
        total_orders=int(total_orders)
    )
    db.session.add(product)
    db.session.commit()

    return jsonify({"success": True, "message": "Product created successfully.", "data": product.to_dict()}), 201


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404

    data = request.get_json() or {}
    if 'name' in data:
        product.name = data['name'].strip()
    if 'category' in data:
        product.category = data['category'].strip()
    if 'price' in data:
        product.price = float(data['price'])
    if 'description' in data:
        product.description = data['description']
    if 'total_orders' in data:
        product.total_orders = int(data['total_orders'])

    db.session.commit()
    return jsonify({"success": True, "message": "Product updated successfully.", "data": product.to_dict()}), 200


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"success": True, "message": "Product deleted successfully."}), 200
