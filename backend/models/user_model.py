import bcrypt
from bson import ObjectId
from database.db import get_db


def create_user(name, email, password, role="member"):
    """Create a new user with hashed password."""
    db = get_db()
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": role,
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
    """Return all users (admin use)."""
    db = get_db()
    users = list(db.users.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return users


def verify_password(stored_hash, password):
    """Verify a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash)
