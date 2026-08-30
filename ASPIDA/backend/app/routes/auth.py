from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/health', methods=['GET'])
def health_check_auth():
    return jsonify({
        "success": True,
        "message": "ASPIDA backend is running"
    }), 200

import traceback

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
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
        print("[AUTH ERROR]", str(err))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Login server error: {str(err)}"
        }), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'analyst').lower()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if role not in ['admin', 'manager', 'analyst']:
        role = 'analyst'

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email address already registered."}), 400

    user = User(name=name, email=email, role=role, is_active=True)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    user_dict = user.to_dict()

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "token": access_token,
        "user": user_dict,
        "data": {
            "token": access_token,
            "user": user_dict
        }
    }), 201


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    user_dict = user.to_dict()
    return jsonify({
        "success": True,
        "user": user_dict,
        "data": user_dict
    }), 200
