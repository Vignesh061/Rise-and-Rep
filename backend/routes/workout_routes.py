from flask import Blueprint, request, jsonify
from models.workout_model import (
    add_workout,
    get_workouts_by_user,
    delete_workout,
    get_all_workouts,
)
from services.workout_service import get_workout_stats
from middleware.auth_middleware import token_required, admin_required

workout_bp = Blueprint("workouts", __name__, url_prefix="/api/workouts")


@workout_bp.route("", methods=["POST"])
@token_required
def create():
    data = request.get_json()
    exercise = data.get("exercise")
    sets = data.get("sets")
    reps = data.get("reps")
    weight = data.get("weight")
    notes = data.get("notes", "")

    if not all([exercise, sets, reps, weight]):
        return jsonify({"error": "exercise, sets, reps, and weight are required"}), 400

    workout_id = add_workout(request.user_id, exercise, sets, reps, weight, notes)
    return jsonify({"id": workout_id, "message": "Workout added successfully"}), 201


@workout_bp.route("", methods=["GET"])
@token_required
def list_workouts():
    workouts = get_workouts_by_user(request.user_id)
    return jsonify(workouts), 200


@workout_bp.route("/<workout_id>", methods=["DELETE"])
@token_required
def remove(workout_id):
    deleted = delete_workout(workout_id, request.user_id)
    if not deleted:
        return jsonify({"error": "Workout not found or not authorised"}), 404
    return jsonify({"message": "Workout deleted"}), 200


@workout_bp.route("/stats", methods=["GET"])
@token_required
def stats():
    data = get_workout_stats(request.user_id)
    return jsonify(data), 200


@workout_bp.route("/all", methods=["GET"])
@admin_required
def all_workouts():
    workouts = get_all_workouts()
    return jsonify(workouts), 200
