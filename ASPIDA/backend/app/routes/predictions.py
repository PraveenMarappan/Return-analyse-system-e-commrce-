from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.nlp_service import NLPService
from app.services.sentiment_service import SentimentService
from app.services.clustering_service import ClusteringService
from app.services.recommendation_service import RecommendationService
from app.services.risk_service import RiskService
from app.services.image_service import ImageService
from app.models import Product, AIInsight, db

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/analyze-return', methods=['POST'])
@jwt_required()
def analyze_return():
    """
    Live AI analysis endpoint supporting multipart form data (text + image) or JSON payload.
    Returns: Primary reason, secondary reason, sentiment, sentiment_score, urgency, confidence, root cause, recommendation, image analysis.
    """
    if request.content_type and 'multipart/form-data' in request.content_type:
        comment = request.form.get('customer_comment', '').strip()
        product_id = request.form.get('product_id')
        user_reason = request.form.get('return_reason')
        image_file = request.files.get('damage_image')
    else:
        data = request.get_json() or {}
        comment = data.get('customer_comment', '').strip()
        product_id = data.get('product_id')
        user_reason = data.get('return_reason')
        image_file = None

    if not comment:
        return jsonify({"success": False, "message": "Customer comment is required for AI analysis."}), 400

    # 1. NLP Reason Classification & Root Cause
    nlp_result = NLPService.classify_return_reason(comment, user_selected_reason=user_reason)

    # 2. Sentiment Analysis
    sentiment_result = SentimentService.analyze_sentiment(comment)

    # 3. Image Analysis (if uploaded)
    image_result = None
    if image_file:
        image_result = ImageService.process_and_analyze_damage(image_file)

    # 4. Fetch product info for risk context
    product_name = "Selected Product"
    product_risk = 35
    if product_id:
        try:
            p_risk = RiskService.calculate_product_risk(int(product_id))
            if p_risk:
                product_name = p_risk['product_name']
                product_risk = p_risk['risk_score']
        except Exception:
            pass

    response_data = {
        "primary_reason": nlp_result["primary_reason"],
        "secondary_reason": nlp_result["secondary_reason"],
        "sentiment": sentiment_result["sentiment"],
        "sentiment_score": sentiment_result["sentiment_score"],
        "urgency": nlp_result["urgency"],
        "confidence": nlp_result["confidence"],
        "root_cause": nlp_result["root_cause"],
        "recommendation": nlp_result["explanation"],
        "product_name": product_name,
        "product_risk_score": product_risk,
        "image_analysis": image_result
    }

    return jsonify({"success": True, "data": response_data}), 200


@predictions_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_ai_insights():
    # 1. Fetch DB insights
    insights_db = AIInsight.query.order_by(AIInsight.id.desc()).all()
    insights = [i.to_dict() for i in insights_db]

    # 2. Fetch ML KMeans clusters as additional dynamic insights
    clusters = ClusteringService.discover_recurring_clusters(n_clusters=4)

    return jsonify({
        "success": True,
        "data": {
            "insights": insights,
            "clusters": clusters
        }
    }), 200


@predictions_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    recs = RecommendationService.generate_recommendations()
    return jsonify({"success": True, "data": recs}), 200


@predictions_bp.route('/risk-products', methods=['GET'])
@jwt_required()
def get_risk_products():
    risks = RiskService.get_all_product_risks()
    high_risks = [r for r in risks if r['risk_score'] >= 50]
    return jsonify({"success": True, "data": high_risks}), 200
