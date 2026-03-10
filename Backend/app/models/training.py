from datetime import datetime
from app.extensions import db

class TrainingPlan(db.Model):
    __tablename__ = 'training_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_coach = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=True)
    type = db.Column(db.String(50), nullable=False, default='fullbody')
    
    cardio_start_duration = db.Column(db.String(50), default='')
    cardio_end_duration = db.Column(db.String(50), default='')
    cardio_total_hours = db.Column(db.String(50), default='')
    
    coach_notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    muscle_groups = db.relationship('MuscleGroup', backref='training_plan', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': str(self.id),
            'assignedTo': str(self.assigned_to),
            'assignedCoach': str(self.assigned_coach),
            'startDate': self.start_date,
            'endDate': self.end_date or '',
            'type': self.type,
            'cardio': {
                'startDuration': self.cardio_start_duration,
                'endDuration': self.cardio_end_duration,
                'totalHours': self.cardio_total_hours
            },
            'coachNotes': self.coach_notes,
            'createdAt': self.created_at.strftime('%Y-%m-%d'),
            'muscleGroups': [mg.to_dict() for mg in self.muscle_groups]
        }

class MuscleGroup(db.Model):
    __tablename__ = 'muscle_groups'

    id = db.Column(db.Integer, primary_key=True)
    training_plan_id = db.Column(db.Integer, db.ForeignKey('training_plans.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    name_he = db.Column(db.String(50), nullable=True)
    
    exercises = db.relationship('Exercise', backref='muscle_group', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'name': self.name,
            'nameHe': self.name_he,
            'exercises': [ex.to_dict() for ex in self.exercises]
        }

class Exercise(db.Model):
    __tablename__ = 'exercises'

    id = db.Column(db.Integer, primary_key=True)
    muscle_group_id = db.Column(db.Integer, db.ForeignKey('muscle_groups.id'), nullable=False)
    
    machine_number = db.Column(db.String(20), default='')
    name = db.Column(db.String(100), nullable=False)
    video_url = db.Column(db.Text, default='')
    sets = db.Column(db.Integer, default=3)
    reps = db.Column(db.Integer, default=12)

    def to_dict(self):
        return {
            'id': str(self.id),
            'machineNumber': self.machine_number,
            'name': self.name,
            'videoUrl': self.video_url,
            'sets': self.sets,
            'reps': self.reps
        }
