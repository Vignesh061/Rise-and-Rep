from flask import Blueprint, request, jsonify
from models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    verify_password,
    get_all_users,
    search_users,
    update_user_profile,
    admin_update_user,
    update_user_password,
    delete_user,
    serialize_user,
)
from models.password_reset_model import (
    create_reset_token,
    find_valid_token,
    delete_token,
)
from utils.jwt_handler import encode_token
from middleware.auth_middleware import token_required, admin_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── User Registration ────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    age = data.get("age")
    gender = data.get("gender")
    mobile = data.get("mobile")
    fitness_goal = data.get("fitness_goal")

    # Validation
    if not all([name, email, password]):
        return jsonify({"error": "Name, email and password are required"}), 400

    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if find_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    user_id = create_user(
        name=name,
        email=email,
        password=password,
        age=age,
        gender=gender,
        mobile=mobile,
        fitness_goal=fitness_goal,
    )
    token = encode_token(user_id, "member")
    return jsonify({
        "token": token,
        "user": {"id": user_id, "name": name, "email": email, "role": "member"},
    }), 201


# ── User Login ───────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user = find_user_by_email(email)
    if not user or not verify_password(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = encode_token(str(user["_id"]), user.get("role", "member"))
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "member"),
        },
    }), 200


# ── User Profile ─────────────────────────────────────────────────

@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile():
    user = find_user_by_id(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user)), 200


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json()
    update_user_profile(request.user_id, data)
    user = find_user_by_id(request.user_id)
    return jsonify({"message": "Profile updated", "user": serialize_user(user)}), 200


# ── Forgot / Reset Password ─────────────────────────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = find_user_by_email(email)
    if not user:
        # Don't reveal whether the email exists
        return jsonify({"message": "If this email exists, a reset link has been sent."}), 200

    token = create_reset_token(str(user["_id"]))
    # In production, send this token via email.
    # For now, return it in the response for testing.
    reset_link = f"/reset-password/{token}"
    return jsonify({
        "message": "If this email exists, a reset link has been sent.",
        "reset_link": reset_link,  # Remove in production
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not all([token, new_password]):
        return jsonify({"error": "Token and new password are required"}), 400

    if confirm_password and new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    record = find_valid_token(token)
    if not record:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    update_user_password(record["user_id"], new_password)
    delete_token(token)
    return jsonify({"message": "Password has been reset successfully"}), 200


# ── Admin: User Management ──────────────────────────────────────

@auth_bp.route("/users", methods=["GET"])
@admin_required
def all_users():
    q = request.args.get("q", "").strip()
    if q:
        users = search_users(q)
    else:
        users = get_all_users()
    return jsonify(users), 200


@auth_bp.route("/users/<user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user)), 200


@auth_bp.route("/users/<user_id>", methods=["PUT"])
@admin_required
def edit_user(user_id):
    data = request.get_json()
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    admin_update_user(user_id, data)
    updated = find_user_by_id(user_id)
    return jsonify({"message": "User updated", "user": serialize_user(updated)}), 200


@auth_bp.route("/users/<user_id>", methods=["DELETE"])
@admin_required
def remove_user(user_id):
    deleted = delete_user(user_id)
    if not deleted:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User deleted"}), 200
