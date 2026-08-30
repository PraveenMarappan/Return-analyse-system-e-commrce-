from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.analytics_service import AnalyticsService

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/simulator/calculate', methods=['POST'])
@jwt_required()
def calculate_simulation():
    data = request.get_json() or {}
    current_returns = data.get('current_returns', 1000)
    expected_reduction_pct = data.get('expected_reduction_pct', 30)
    avg_return_cost = data.get('avg_return_cost', 250.0)
    avg_product_price = data.get('avg_product_price', 1200.0)

    result = AnalyticsService.calculate_what_if_simulation(
        current_returns=current_returns,
        expected_reduction_pct=expected_reduction_pct,
        avg_return_cost=avg_return_cost,
        avg_product_price=avg_product_price
    )

    if not result.get('success'):
        return jsonify({"success": False, "message": result.get('message')}), 400

    return jsonify({"success": True, "data": result}), 200
