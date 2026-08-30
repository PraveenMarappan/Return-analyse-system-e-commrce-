import sys
import os

# Add ASPIDA backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ASPIDA', 'backend'))

try:
    from app import create_app, db
    app = create_app()

    with app.app_context():
        db.create_all()
        try:
            from seed_database import seed
            seed()
        except Exception as seed_err:
            print(f"[VERCEL API] Seed status: {seed_err}")
except Exception as err:
    print(f"[VERCEL API] Initialization error: {err}")
    from flask import Flask, jsonify
    app = Flask(__name__)
    @app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def fallback(path):
        return jsonify({"success": False, "message": f"Server initialization error: {str(err)}"}), 500

# Vercel WSGI entry point
handler = app
