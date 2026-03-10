from flask import Blueprint, request, jsonify
from app.models.training import TrainingPlan, MuscleGroup, Exercise
from app.extensions import db

workouts_bp = Blueprint('workouts', __name__)

@workouts_bp.route('/', methods=['GET'])
def get_workouts():
    user_id = request.args.get('userId')
    if user_id:
        plans = TrainingPlan.query.filter_by(assigned_to=user_id).all()
    else:
        plans = TrainingPlan.query.all()
    return jsonify([p.to_dict() for p in plans]), 200

@workouts_bp.route('/', methods=['POST'])
def create_workout():
    data = request.get_json()
    
    # Check for overwrite
    overwrite_id = request.args.get('overwriteId')
    if overwrite_id:
        plan = TrainingPlan.query.get(overwrite_id)
        if plan:
            db.session.delete(plan)
            db.session.commit()
            
    new_plan = TrainingPlan(
        assigned_to=data['assignedTo'],
        assigned_coach=data['assignedCoach'],
        start_date=data['startDate'],
        end_date=data.get('endDate'),
        type=data['type'],
        cardio_start_duration=data.get('cardio', {}).get('startDuration', ''),
        cardio_end_duration=data.get('cardio', {}).get('endDuration', ''),
        cardio_total_hours=data.get('cardio', {}).get('totalHours', ''),
        coach_notes=data.get('coachNotes', '')
    )
    
    for mg_data in data.get('muscleGroups', []):
        mg = MuscleGroup(name=mg_data['name'], name_he=mg_data.get('nameHe', ''))
        for ex_data in mg_data.get('exercises', []):
            ex = Exercise(
                machine_number=ex_data.get('machineNumber', ''),
                name=ex_data['name'],
                video_url=ex_data.get('videoUrl', ''),
                sets=ex_data.get('sets', 3),
                reps=ex_data.get('reps', 12)
            )
            mg.exercises.append(ex)
        new_plan.muscle_groups.append(mg)

    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify(new_plan.to_dict()), 201
