from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, db
from sqlalchemy import inspect
import traceback

auth_bp = Blueprint('auth', __name__)

def ensure_db_ready():
    try:
        engine = db.engine
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"[DB DIAG] Engine URI: {engine.url}")
        print(f"[DB DIAG] Existing tables: {existing_tables}")

        if 'users' not in existing_tables:
            print("[DB DIAG] Table 'users' missing. Running db.create_all()...")
            db.create_all()
            existing_tables = inspect(db.engine).get_table_names()

        admin_user = User.query.filter_by(email='admin@aspida.com').first()
        if not admin_user:
            print("[DB DIAG] Seed users missing. Creating demo users...")
            admin = User(name='ASPIDA Admin', email='admin@aspida.com', role='admin', is_active=True)
            admin.set_password('admin123')
            manager = User(name='Returns Manager', email='manager@aspida.com', role='manager', is_active=True)
            manager.set_password('manager123')
            analyst = User(name='Data Analyst', email='analyst@aspida.com', role='analyst', is_active=True)
            analyst.set_password('analyst123')
            db.session.add_all([admin, manager, analyst])
            db.session.commit()
            admin_user = User.query.filter_by(email='admin@aspida.com').first()

        print(f"[DB DIAG] USER TABLE EXISTS: {'YES' if 'users' in existing_tables else 'NO'}")
        print(f"[DB DIAG] ADMIN USER EXISTS: {'YES' if admin_user is not None else 'NO'}")
        return True
    except Exception as e:
        print(f"[DB DIAG ERROR] Database setup error: {str(e)}")
        traceback.print_exc()
        try:
            db.session.rollback()
        except Exception:
            pass
        return False

@auth_bp.route('/health', methods=['GET'])
def health_check_auth():
    return jsonify({
        "status": "ok",
        "service": "ASPIDA Authentication API"
    }), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Ensure database schema and demo users are ready before executing query
        db_ok = ensure_db_ready()
        if not db_ok:
            print("[AUTH ERROR] Database failed to initialize")

        data = request.get_json() or {}
        email = data.get('email', '')
        password = data.get('password', '')

        if not isinstance(email, str) or not isinstance(password, str):
            return jsonify({"success": False, "message": "Please enter your email and password."}), 400

        email = email.strip().lower()

        if not email or not password:
            return jsonify({"success": False, "message": "Please enter your email and password."}), 400

        print(f"[AUTH] Login attempt for: {email}")
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"[AUTH] User not found: {email}")
            return jsonify({"success": False, "message": "Invalid email or password."}), 401

        is_password_valid = user.check_password(password)
        if not is_password_valid:
            print(f"[AUTH] Invalid password for: {email}")
            return jsonify({"success": False, "message": "Invalid email or password."}), 401

        if not user.is_active:
            return jsonify({"success": False, "message": "User account is deactivated."}), 403

        access_token = create_access_token(identity=str(user.id))

        user_dict = user.to_dict()
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": access_token,
            "user": user_dict,
            "data": {
                "token": access_token,
                "user": user_dict
            }
        }), 200
    except Exception as err:
        tb_str = traceback.format_exc()
        print("[AUTH ERROR]", str(err))
        print(tb_str)
        return jsonify({
            "success": False,
            "error": type(err).__name__,
            "message": str(err),
            "traceback": tb_str
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'analyst').strip().lower()

    if not email or not password or not name:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User with this email already exists."}), 400

    new_user = User(name=name, email=email, role=role, is_active=True)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "token": access_token,
        "user": new_user.to_dict()
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200
