from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Alert, db

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    status = request.args.get('status')
    severity = request.args.get('severity')

    query = Alert.query

    if status and status != 'All':
        query = query.filter(Alert.status == status)

    if severity and severity != 'All':
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.id.desc()).all()
    return jsonify({"success": True, "data": [a.to_dict() for a in alerts]}), 200


@alerts_bp.route('/<int:alert_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"success": False, "message": "Alert not found."}), 404

    alert.status = 'read'
    db.session.commit()
    return jsonify({"success": True, "message": "Alert marked as read.", "data": alert.to_dict()}), 200


@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def mark_resolved(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"success": False, "message": "Alert not found."}), 404

    alert.status = 'resolved'
    db.session.commit()
    return jsonify({"success": True, "message": "Alert marked as resolved.", "data": alert.to_dict()}), 200
