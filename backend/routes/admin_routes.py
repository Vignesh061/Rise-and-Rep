from flask import Blueprint, request, jsonify
from models.admin_model import find_admin_by_username, verify_admin_password
from models.user_model import get_user_count
from models.trainer_model import get_trainer_count
from models.membership_model import get_package_count
from utils.jwt_handler import encode_token
from middleware.auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password")

    if not all([username, password]):
        return jsonify({"error": "Username and password are required"}), 400

    admin = find_admin_by_username(username)
    if not admin or not verify_admin_password(admin["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = encode_token(str(admin["_id"]), "admin")
    return jsonify({
        "token": token,
        "user": {
            "id": str(admin["_id"]),
            "username": admin["username"],
            "role": "admin",
        },
    }), 200


@admin_bp.route("/dashboard-stats", methods=["GET"])
@admin_required
def dashboard_stats():
    return jsonify({
        "total_users": get_user_count(),
        "total_trainers": get_trainer_count(),
        "total_plans": get_package_count(),
    }), 200
