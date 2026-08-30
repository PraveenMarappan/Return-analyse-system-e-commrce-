from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.analytics_service import AnalyticsService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    category = request.args.get('category')
    product = request.args.get('product')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    summary = AnalyticsService.get_dashboard_summary(
        category_filter=category,
        product_filter=product,
        date_from=date_from,
        date_to=date_to
    )

    return jsonify({"success": True, "data": summary}), 200


@dashboard_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trends():
    category = request.args.get('category')
    product = request.args.get('product')
    charts = AnalyticsService.get_dashboard_charts(category_filter=category, product_filter=product)

    return jsonify({
        "success": True,
        "data": {
            "monthly_volume": charts["monthly_volume"],
            "return_trends": charts["return_trends"]
        }
    }), 200


@dashboard_bp.route('/reasons', methods=['GET'])
@jwt_required()
def get_reasons():
    category = request.args.get('category')
    product = request.args.get('product')
    charts = AnalyticsService.get_dashboard_charts(category_filter=category, product_filter=product)

    return jsonify({"success": True, "data": charts["reasons"]}), 200


@dashboard_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    category = request.args.get('category')
    product = request.args.get('product')
    charts = AnalyticsService.get_dashboard_charts(category_filter=category, product_filter=product)

    return jsonify({"success": True, "data": charts["categories"]}), 200
