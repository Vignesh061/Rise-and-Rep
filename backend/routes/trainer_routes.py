from flask import Blueprint, request, jsonify
from models.trainer_model import (
    get_all_trainers,
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
