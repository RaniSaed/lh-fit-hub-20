from flask import Blueprint, request, jsonify
from app.models.training import TrainingPlan, MuscleGroup, Exercise
from app.extensions import db

workouts_bp = Blueprint('workouts', __name__)

@workouts_bp.route('/', methods=['GET'])
def get_workouts():
    user_id = request.args.get('userId')
    if user_id and user_id.isdigit():
        plans = TrainingPlan.query.filter_by(assigned_to=int(user_id)).all()
    else:
        plans = TrainingPlan.query.all()
    return jsonify([p.to_dict() for p in plans]), 200

@workouts_bp.route('/', methods=['POST'])
def create_workout():
    data = request.get_json()
    
    # Check for overwrite
    overwrite_id = request.args.get('overwriteId')
    if overwrite_id and overwrite_id.isdigit():
        plan = TrainingPlan.query.get(int(overwrite_id))
        if plan:
            db.session.delete(plan)
            db.session.commit()
            
    assigned_coach = data.get('assignedCoach')
    if not assigned_coach:
        assigned_coach = None
            
    new_plan = TrainingPlan(
        assigned_to=int(data['assignedTo']),
        assigned_coach=int(assigned_coach) if assigned_coach else None,
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
            
            raw_sets = str(ex_data.get('sets', ''))
            raw_reps = str(ex_data.get('reps', ''))
            
            ex = Exercise(
                machine_number=ex_data.get('machineNumber', ''),
                name=ex_data['name'],
                video_url=ex_data.get('videoUrl', ''),
                sets=int(raw_sets) if raw_sets.isdigit() else 3,
                reps=int(raw_reps) if raw_reps.isdigit() else 12
            )
            mg.exercises.append(ex)
        new_plan.muscle_groups.append(mg)

    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify(new_plan.to_dict()), 201
