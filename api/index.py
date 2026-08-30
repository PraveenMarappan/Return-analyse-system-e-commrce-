import sys
import os

# Add ASPIDA backend directory to sys.path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ASPIDA', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    try:
        db.create_all()
        # Seed demo users if they do not exist
        if not User.query.filter_by(email='admin@aspida.com').first():
            admin = User(name='ASPIDA Admin', email='admin@aspida.com', role='admin', is_active=True)
            admin.set_password('admin123')
            manager = User(name='Returns Manager', email='manager@aspida.com', role='manager', is_active=True)
            manager.set_password('manager123')
            analyst = User(name='Data Analyst', email='analyst@aspida.com', role='analyst', is_active=True)
            analyst.set_password('analyst123')
            db.session.add_all([admin, manager, analyst])
            db.session.commit()
            print("[VERCEL API] Initialized demo accounts.")
    except Exception as e:
        print(f"[VERCEL API] User init status: {e}")
