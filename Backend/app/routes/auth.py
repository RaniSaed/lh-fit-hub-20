from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400
        
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "token": access_token,
            "user": user.to_dict()
        }), 200
        
    return jsonify({"error": "Invalid username or password"}), 401
    
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password') or not data.get('phone'):
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "User already exists"}), 409
        
    new_user = User(
        username=data['username'],
        phone=data['phone'],
        role='client' # Default role
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(new_user.to_dict()), 201
