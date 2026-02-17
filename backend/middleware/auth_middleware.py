from functools import wraps
from flask import request, jsonify
from utils.jwt_handler import decode_token


def token_required(f):
    """Decorator that verifies the JWT token from the Authorization header."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Token is invalid or expired"}), 401

        request.user_id = payload["user_id"]
        request.user_role = payload["role"]
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator that ensures the user has the admin role."""

    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return decorated
