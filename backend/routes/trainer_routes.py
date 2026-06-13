from flask import Blueprint, request, jsonify
from models.trainer_model import (
    get_all_trainers,
    find_trainer_by_id,
    create_trainer,
    update_trainer,
    delete_trainer,
    book_trainer,
    get_bookings_by_user,
    get_all_bookings,
)
from middleware.auth_middleware import token_required, admin_required

trainer_bp = Blueprint("trainers", __name__, url_prefix="/api/trainers")


@trainer_bp.route("", methods=["GET"])
@token_required
def list_trainers():
    trainers = get_all_trainers()
    return jsonify(trainers), 200


@trainer_bp.route("/<trainer_id>", methods=["GET"])
@token_required
def get_trainer(trainer_id):
    trainer = find_trainer_by_id(trainer_id)
    if not trainer:
        return jsonify({"error": "Trainer not found"}), 404
    return jsonify(trainer), 200


@trainer_bp.route("", methods=["POST"])
@admin_required
def add_trainer():
    data = request.get_json()
    name = data.get("name")
    specialization = data.get("specialization")
    email = data.get("email")

    if not all([name, specialization, email]):
        return jsonify({"error": "Name, specialization, and email are required"}), 400

    trainer_id = create_trainer(data)
    return jsonify({"id": trainer_id, "message": "Trainer added successfully"}), 201


@trainer_bp.route("/<trainer_id>", methods=["PUT"])
@admin_required
def edit_trainer(trainer_id):
    data = request.get_json()
    trainer = find_trainer_by_id(trainer_id)
    if not trainer:
        return jsonify({"error": "Trainer not found"}), 404
    update_trainer(trainer_id, data)
    updated = find_trainer_by_id(trainer_id)
    return jsonify({"message": "Trainer updated", "trainer": updated}), 200


@trainer_bp.route("/<trainer_id>", methods=["DELETE"])
@admin_required
def remove_trainer(trainer_id):
    deleted = delete_trainer(trainer_id)
    if not deleted:
        return jsonify({"error": "Trainer not found"}), 404
    return jsonify({"message": "Trainer deleted"}), 200


@trainer_bp.route("/book", methods=["POST"])
@token_required
def book():
    data = request.get_json()
    trainer_id = data.get("trainer_id")
    date = data.get("date")
    time_slot = data.get("time_slot")

    if not all([trainer_id, date, time_slot]):
        return jsonify({"error": "trainer_id, date and time_slot are required"}), 400

    booking_id = book_trainer(request.user_id, trainer_id, date, time_slot)
    return jsonify({"id": booking_id, "message": "Booking confirmed"}), 201


@trainer_bp.route("/bookings", methods=["GET"])
@token_required
def my_bookings():
    bookings = get_bookings_by_user(request.user_id)
    return jsonify(bookings), 200


@trainer_bp.route("/bookings/all", methods=["GET"])
@admin_required
def all_bookings():
    bookings = get_all_bookings()
    return jsonify(bookings), 200
