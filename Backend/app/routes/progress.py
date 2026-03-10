from flask import Blueprint, request, jsonify
from app.models.progress import ProgressEntry
from app.extensions import db

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/', methods=['GET'])
def get_progress():
    user_id = request.args.get('userId')
    if user_id:
        entries = ProgressEntry.query.filter_by(user_id=user_id).all()
    else:
        entries = ProgressEntry.query.all()
    return jsonify([p.to_dict() for p in entries]), 200

@progress_bp.route('/', methods=['POST'])
def create_progress():
    data = request.get_json()
    
    overwrite_id = request.args.get('overwriteId')
    if overwrite_id:
        entry = ProgressEntry.query.get(overwrite_id)
        if entry:
            db.session.delete(entry)
            db.session.commit()
            
    new_entry = ProgressEntry(
        user_id=data['userId'],
        date=data['date'],
        end_date=data.get('endDate'),
        weight=data.get('weight', ''),
        fat_percent=data.get('fatPercent', ''),
        upper_abs=data.get('upperAbs', ''),
        mid_abs=data.get('midAbs', ''),
        lower_abs=data.get('lowerAbs', ''),
        right_arm=data.get('rightArm', ''),
        left_arm=data.get('leftArm', ''),
        right_thigh=data.get('rightThigh', ''),
        left_thigh=data.get('leftThigh', ''),
        glutes=data.get('glutes', ''),
        chest=data.get('chest', '')
    )

    db.session.add(new_entry)
    db.session.commit()
    
    return jsonify(new_entry.to_dict()), 201
