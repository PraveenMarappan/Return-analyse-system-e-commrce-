from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.report_service import ReportService
from app.models import Report, db
from app.config import Config
import os

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('', methods=['GET'])
@jwt_required()
def get_reports():
    reports = Report.query.order_by(Report.id.desc()).all()
    return jsonify({"success": True, "data": [r.to_dict() for r in reports]}), 200


@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    title = data.get('title', 'Executive Return Intelligence Report')

    try:
        report_data = ReportService.generate_pdf_report(user_id=user_id, title=title)
        return jsonify({
            "success": True,
            "message": "PDF report generated successfully.",
            "data": report_data
        }), 201
    except Exception as e:
        print(f"[Reports Route] Error generating report: {e}")
        return jsonify({"success": False, "message": f"Failed to generate report: {str(e)}"}), 500


@reports_bp.route('/download/<filename>', methods=['GET'])

def download_report(filename):
    safe_filename = os.path.basename(filename)
    report_path = os.path.join(Config.REPORT_FOLDER, safe_filename)
    if not os.path.exists(report_path):
        return jsonify({"success": False, "message": "Report file not found."}), 404
    return send_from_directory(Config.REPORT_FOLDER, safe_filename, as_attachment=True)
