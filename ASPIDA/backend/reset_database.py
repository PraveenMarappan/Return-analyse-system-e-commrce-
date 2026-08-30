import os
import sys

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db

def reset_database():
    print("==================================================")
    print("WARNING: DEVELOPMENT ONLY DATABASE RESET")
    print("This will completely delete the existing SQLite database")
    print("and re-create tables with clean demo data.")
    print("==================================================")

    app = create_app()
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')

    with app.app_context():
        # Drop all tables first via SQLAlchemy
        db.drop_all()
        db.session.remove()

    if db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"[Reset] Removed database file: {db_path}")
        except Exception as e:
            print(f"[Reset] Warning: Could not remove DB file directly ({e}), proceeding with table re-creation.")

    # Re-import and run seed
    from seed_database import seed
    print("[Reset] Re-creating database and seeding demo data...")
    seed(reset_db=True)
    print("[Reset] Database reset completed successfully!")

if __name__ == '__main__':
    reset_database()
