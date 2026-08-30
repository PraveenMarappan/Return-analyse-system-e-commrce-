from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, db

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == 'admin'

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"success": False, "message": "Admin privileges required."}), 403

    users = User.query.order_by(User.id.asc()).all()
    return jsonify({"success": True, "data": [u.to_dict() for u in users]}), 200


@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"success": False, "message": "Admin privileges required."}), 403

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'analyst').lower()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already registered."}), 400

    user = User(name=name, email=email, role=role, is_active=True)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True, "message": "User created successfully.", "data": user.to_dict()}), 201


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"success": False, "message": "Admin privileges required."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    data = request.get_json() or {}
    if 'name' in data:
        user.name = data['name'].strip()
    if 'role' in data:
        user.role = data['role'].lower()
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({"success": True, "message": "User updated successfully.", "data": user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"success": False, "message": "Admin privileges required."}), 403

    if int(current_user_id) == user_id:
        return jsonify({"success": False, "message": "Cannot delete your own admin account."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User deleted successfully."}), 200
