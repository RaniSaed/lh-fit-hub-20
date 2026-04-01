from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
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
        if not user.is_active:
            return jsonify({"error": "Your account is expired - go to the secretary to make your account active."}), 403
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": access_token,
            "user": user.to_dict()
        }), 200
        
    return jsonify({"error": "Invalid username or password"}), 401
    
@auth_bp.route('/change-password', methods=['POST', 'OPTIONS'])
def change_password():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    # Manually verify JWT for POST since we removed the decorator for OPTIONS
    from flask_jwt_extended import verify_jwt_in_request
    verify_jwt_in_request()
    
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({"error": "Missing old or new password"}), 400
        
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if not user.check_password(data['old_password']):
        return jsonify({"error": "Incorrect current password"}), 401
        
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({"message": "Password updated successfully"}), 200
