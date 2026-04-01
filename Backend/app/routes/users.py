from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
def get_users():
    # In a real app, only admins/coaches should view all users
    # For now, keeping it accessible for the mock frontend mapping
    users = User.query.filter_by(role='client').all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/admins', methods=['GET'])
def get_admins():
    admins = User.query.filter(User.role.in_(['coach', 'superadmin'])).all()
    return jsonify([u.to_dict() for u in admins]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@users_bp.route('/', methods=['POST'])
def add_user():
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "User already exists"}), 409
        
    new_user = User(
        username=data.get('username'),
        phone=data.get('phone'),
        role=data.get('role', 'client'),
        medical_history=data.get('medicalHistory', ''),
        is_active=data.get('isActive', True)
    )
    # Give a default password if created by admin
    new_user.set_password(data.get('password', 'client123'))

    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@users_bp.route('/<int:user_id>', methods=['PUT', 'PATCH'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'username' in data: user.username = data['username']
    if 'phone' in data: user.phone = data['phone']
    if 'role' in data: user.role = data['role']
    if 'medicalHistory' in data: user.medical_history = data['medicalHistory']
    if 'isActive' in data: user.is_active = data['isActive']
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>/toggle-status', methods=['PATCH'])
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
