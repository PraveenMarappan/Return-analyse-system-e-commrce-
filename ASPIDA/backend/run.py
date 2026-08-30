from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("Starting ASPIDA Flask Backend Server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
