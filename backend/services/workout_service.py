from models.workout_model import get_workouts_by_user


def get_workout_stats(user_id):
    """Compute basic workout statistics for a user."""
    workouts = get_workouts_by_user(user_id)
    if not workouts:
        return {
            "total_workouts": 0,
            "total_sets": 0,
            "total_reps": 0,
            "exercises": [],
            "max_weight": 0,
        }

    total_sets = sum(w["sets"] for w in workouts)
    total_reps = sum(w["reps"] for w in workouts)
    max_weight = max(w["weight"] for w in workouts)
    exercises = list({w["exercise"] for w in workouts})

    return {
        "total_workouts": len(workouts),
        "total_sets": total_sets,
        "total_reps": total_reps,
        "max_weight": max_weight,
        "exercises": exercises,
    }
