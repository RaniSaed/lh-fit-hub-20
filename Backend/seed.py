import os
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.training import TrainingPlan, MuscleGroup, Exercise
from app.models.progress import ProgressEntry

app = create_app('development')

def seed_database():
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("Creating mock users...")
        users = [
            User(username='superadmin', phone='0500000000', role='superadmin', created_at=db.func.now()),
            User(username='coach_mike', phone='0501111111', role='coach', created_at=db.func.now()),
            User(username='john_doe', phone='0502222222', role='client', medical_history='Lower back injury - herniated disc L4-L5', created_at=db.func.now()),
            User(username='jane_smith', phone='0503333333', role='client', created_at=db.func.now()),
            User(username='alex_cohen', phone='0504444444', role='client', medical_history='Knee surgery recovery - ACL repair', created_at=db.func.now()),
            User(username='sarah_levi', phone='0505555555', role='client', created_at=db.func.now())
        ]
        users[0].set_password('admin123!@#')
        users[1].set_password('coach123')
        for i in range(2, 6):
            users[i].set_password('client123')
            
        db.session.add_all(users)
        db.session.commit()
        
        # Reload john_doe to get his ID
        john = User.query.filter_by(username='john_doe').first()
        mike = User.query.filter_by(username='coach_mike').first()

        print("Creating mock training plan...")
        tp = TrainingPlan(
            assigned_to=john.id,
            assigned_coach=mike.id,
            start_date='2024-06-01',
            end_date='2024-06-30',
            type='fullbody',
            cardio_start_duration='10-15 min',
            cardio_end_duration='20-30 min',
            coach_notes='Focus on form, avoid heavy weights on back exercises due to medical condition.'
        )
        
        mg1 = MuscleGroup(name='Chest')
        mg1.exercises.extend([
            Exercise(machine_number='12', name='Bench Press', sets=4, reps=12),
            Exercise(machine_number='14', name='Chest Fly', sets=3, reps=15)
        ])
        
        mg2 = MuscleGroup(name='Back')
        mg2.exercises.append(Exercise(machine_number='8', name='Lat Pulldown', sets=4, reps=10))

        mg3 = MuscleGroup(name='Shoulders')
        mg3.exercises.append(Exercise(machine_number='6', name='Shoulder Press', sets=3, reps=12))
        
        mg4 = MuscleGroup(name='Arms')
        mg4.exercises.append(Exercise(machine_number='22', name='Bicep Curl', sets=3, reps=15))
        
        mg5 = MuscleGroup(name='Abs')
        mg5.exercises.append(Exercise(machine_number='-', name='Crunches', sets=3, reps=20))
        
        mg6 = MuscleGroup(name='Legs')
        mg6.exercises.append(Exercise(machine_number='30', name='Leg Press', sets=4, reps=12))

        tp.muscle_groups.extend([mg1, mg2, mg3, mg4, mg5, mg6])
        db.session.add(tp)
        
        print("Creating mock progress entries...")
        p1 = ProgressEntry(user_id=john.id, date='2024-06-01', end_date='2024-06-30', weight='85', fat_percent='22', upper_abs='90', mid_abs='88', lower_abs='92', right_arm='35', left_arm='34', right_thigh='58', left_thigh='57', glutes='100', chest='105')
        p2 = ProgressEntry(user_id=john.id, date='2024-07-01', weight='83', fat_percent='20', upper_abs='88', mid_abs='86', lower_abs='90', right_arm='36', left_arm='35', right_thigh='57', left_thigh='56', glutes='99', chest='104')
        db.session.add_all([p1, p2])
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
