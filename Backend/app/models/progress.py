from datetime import datetime
from app.extensions import db

class ProgressEntry(db.Model):
    __tablename__ = 'progress_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=True)
    
    weight = db.Column(db.String(20), default='')
    fat_percent = db.Column(db.String(20), default='')
    upper_abs = db.Column(db.String(20), default='')
    mid_abs = db.Column(db.String(20), default='')
    lower_abs = db.Column(db.String(20), default='')
    right_arm = db.Column(db.String(20), default='')
    left_arm = db.Column(db.String(20), default='')
    right_thigh = db.Column(db.String(20), default='')
    left_thigh = db.Column(db.String(20), default='')
    glutes = db.Column(db.String(20), default='')
    chest = db.Column(db.String(20), default='')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'userId': str(self.user_id),
            'date': self.date,
            'endDate': self.end_date or '',
            'weight': self.weight,
            'fatPercent': self.fat_percent,
            'upperAbs': self.upper_abs,
            'midAbs': self.mid_abs,
            'lowerAbs': self.lower_abs,
            'rightArm': self.right_arm,
            'leftArm': self.left_arm,
            'rightThigh': self.right_thigh,
            'leftThigh': self.left_thigh,
            'glutes': self.glutes,
            'chest': self.chest
        }
