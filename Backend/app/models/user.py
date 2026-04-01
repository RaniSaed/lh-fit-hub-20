from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='client') # client, coach, superadmin
    medical_history = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    training_plans = db.relationship('TrainingPlan', backref='client_user', foreign_keys="TrainingPlan.assigned_to", lazy='dynamic')
    coached_plans = db.relationship('TrainingPlan', backref='coach_user', foreign_keys="TrainingPlan.assigned_coach", lazy='dynamic')
    progress_entries = db.relationship('ProgressEntry', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'phone': self.phone,
            'role': self.role,
            'medicalHistory': self.medical_history,
            'isActive': self.is_active,
            'createdAt': self.created_at.strftime('%Y-%m-%d')
        }
