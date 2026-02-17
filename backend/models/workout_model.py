import datetime
from bson import ObjectId
from database.db import get_db


def add_workout(user_id, exercise, sets, reps, weight, notes=""):
    """Add a workout entry for a user."""
    db = get_db()
    workout = {
        "user_id": user_id,
        "exercise": exercise,
        "sets": int(sets),
        "reps": int(reps),
        "weight": float(weight),
        "notes": notes,
        "date": datetime.datetime.utcnow(),
    }
    result = db.workouts.insert_one(workout)
    return str(result.inserted_id)


def get_workouts_by_user(user_id):
    """Return all workouts for a given user."""
    db = get_db()
    workouts = list(db.workouts.find({"user_id": user_id}).sort("date", -1))
    for w in workouts:
        w["_id"] = str(w["_id"])
        w["date"] = w["date"].isoformat()
    return workouts


def delete_workout(workout_id, user_id):
    """Delete a workout by ID if it belongs to the user."""
    db = get_db()
    result = db.workouts.delete_one(
        {"_id": ObjectId(workout_id), "user_id": user_id}
    )
    return result.deleted_count > 0


def get_all_workouts():
    """Return all workouts (admin)."""
    db = get_db()
    workouts = list(db.workouts.find().sort("date", -1))
    for w in workouts:
        w["_id"] = str(w["_id"])
        w["date"] = w["date"].isoformat()
    return workouts
