from flask import Blueprint, request, jsonify
from models.membership_model import (
    create_membership,
    get_membership_by_user,
    get_all_memberships,
)
from middleware.auth_middleware import token_required, admin_required

membership_bp = Blueprint("memberships", __name__, url_prefix="/api/memberships")

PLANS = {
    "basic": {"price": 29.99, "duration": 30, "features": ["Gym access", "Locker room"]},
    "standard": {"price": 49.99, "duration": 30, "features": ["Gym access", "Locker room", "Group classes", "Sauna"]},
    "premium": {"price": 79.99, "duration": 30, "features": ["Gym access", "Locker room", "Group classes", "Sauna", "Personal trainer", "Nutrition plan"]},
}


@membership_bp.route("/plans", methods=["GET"])
def list_plans():
    return jsonify(PLANS), 200


@membership_bp.route("", methods=["POST"])
@token_required
def subscribe():
    data = request.get_json()
    plan = data.get("plan", "basic")
    if plan not in PLANS:
        return jsonify({"error": "Invalid plan"}), 400

    duration = PLANS[plan]["duration"]
    mem_id = create_membership(request.user_id, plan, duration)
    return jsonify({"id": mem_id, "message": f"Subscribed to {plan} plan"}), 201


@membership_bp.route("", methods=["GET"])
@token_required
def my_membership():
    membership = get_membership_by_user(request.user_id)
    if not membership:
        return jsonify({"message": "No active membership"}), 200
    return jsonify(membership), 200


@membership_bp.route("/all", methods=["GET"])
@admin_required
def all_memberships():
    memberships = get_all_memberships()
    return jsonify(memberships), 200
