import datetime
import bcrypt
from bson import ObjectId
from database.db import get_db


def create_user(name, email, password, age=None, gender=None, mobile=None, fitness_goal=None):
    """Create a new user with hashed password and extended profile fields."""
    db = get_db()
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": "member",
        "age": age,
        "gender": gender,
        "mobile": mobile,
        "height": None,
        "weight": None,
        "target_weight": None,
        "bmi": None,
        "fitness_goal": fitness_goal,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
    }
    result = db.users.insert_one(user)
    return str(result.inserted_id)


def find_user_by_email(email):
    """Find a user by email."""
    db = get_db()
    return db.users.find_one({"email": email})


def find_user_by_id(user_id):
    """Find a user by ObjectId."""
    db = get_db()
    return db.users.find_one({"_id": ObjectId(user_id)})


def get_all_users():
    """Return all users (admin use), excluding password."""
    db = get_db()
    users = list(db.users.find({"role": {"$ne": "admin"}}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
        if "created_at" in u and u["created_at"]:
            u["created_at"] = u["created_at"].isoformat()
    return users


def get_user_count():
    """Return the total number of non-admin users."""
    db = get_db()
    return db.users.count_documents({"role": {"$ne": "admin"}})


def search_users(query):
    """Search users by name or email (case-insensitive)."""
    db = get_db()
    regex = {"$regex": query, "$options": "i"}
    users = list(
        db.users.find(
            {"$and": [{"role": {"$ne": "admin"}}, {"$or": [{"name": regex}, {"email": regex}]}]},
            {"password": 0},
        )
    )
    for u in users:
        u["_id"] = str(u["_id"])
        if "created_at" in u and u["created_at"]:
            u["created_at"] = u["created_at"].isoformat()
    return users


def update_user_profile(user_id, data):
    """Update editable profile fields and auto-calculate BMI."""
    db = get_db()
    allowed_fields = ["name", "age", "mobile", "height", "weight", "target_weight", "fitness_goal"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

    # Auto-calculate BMI if height and weight are present
    user = find_user_by_id(user_id)
    height = update_data.get("height", user.get("height") if user else None)
    weight = update_data.get("weight", user.get("weight") if user else None)
    if height and weight:
        try:
            h = float(height) / 100  # cm to m
            w = float(weight)
            if h > 0:
                update_data["bmi"] = round(w / (h * h), 1)
        except (ValueError, ZeroDivisionError):
            pass

    if update_data:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return True


def admin_update_user(user_id, data):
    """Admin can update user fields including status."""
    db = get_db()
    allowed_fields = ["name", "age", "mobile", "height", "weight", "target_weight", "fitness_goal", "status"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    if update_data:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return True


def update_user_password(user_id, new_password):
    """Update user's password (hashed)."""
    db = get_db()
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed}})
    return True


def delete_user(user_id):
    """Delete a user by ID."""
    db = get_db()
    result = db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0


def verify_password(stored_hash, password):
    """Verify a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash)


def serialize_user(user):
    """Serialize a user document for JSON response (exclude password)."""
    if not user:
        return None
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "member"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "mobile": user.get("mobile"),
        "height": user.get("height"),
        "weight": user.get("weight"),
        "target_weight": user.get("target_weight"),
        "bmi": user.get("bmi"),
        "fitness_goal": user.get("fitness_goal"),
        "status": user.get("status", "active"),
        "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
    }
