import sys
import os

# Add ASPIDA backend directory to sys.path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ASPIDA', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
    try:
        from seed_database import seed
        seed()
    except Exception as e:
        print(f"[VERCEL API] Seed status: {e}")
