from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
    try:
        from seed_database import seed
        seed()
    except Exception as e:
        print(f"[WSGI] Database seed status: {e}")

if __name__ == '__main__':
    app.run()
