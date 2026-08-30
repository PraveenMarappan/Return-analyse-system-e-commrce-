import os
from flask import Flask, send_from_directory, jsonify
from app.config import Config
from app.extensions import db, cors, jwt

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "*"
            ]
        }
    })
    jwt.init_app(app)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "success": True,
            "message": "ASPIDA backend is running"
        }), 200

    # Ensure directories exist
    os.makedirs(os.path.join(app.config['BASE_DIR'] if hasattr(app.config, 'BASE_DIR') else os.path.dirname(app.root_path), 'instance'), exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORT_FOLDER'], exist_ok=True)
    os.makedirs(app.config['MODEL_FOLDER'], exist_ok=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.returns import returns_bp
    from app.routes.products import products_bp
    from app.routes.predictions import predictions_bp
    from app.routes.analytics import analytics_bp
    from app.routes.reports import reports_bp
    from app.routes.alerts import alerts_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(returns_bp, url_prefix='/api/returns')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(predictions_bp, url_prefix='/api/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Static uploads handler
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Global JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"success": False, "message": "Missing or invalid authorization token."}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Authorization token has expired. Please log in again."}), 401

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found."}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error."}), 500

    return app
