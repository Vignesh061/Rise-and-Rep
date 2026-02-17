from flask import Blueprint, request, jsonify
from models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    verify_password,
    get_all_users,
)
from utils.jwt_handler import encode_token
from middleware.auth_middleware import token_required, admin_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "member")

    if not all([name, email, password]):
        return jsonify({"error": "Name, email and password are required"}), 400

    if find_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    user_id = create_user(name, email, password, role)
    token = encode_token(user_id, role)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email, "role": role}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user = find_user_by_email(email)
    if not user or not verify_password(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = encode_token(str(user["_id"]), user["role"])
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }), 200


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile():
    user = find_user_by_id(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }), 200


@auth_bp.route("/users", methods=["GET"])
@admin_required
def all_users():
    users = get_all_users()
    return jsonify(users), 200
