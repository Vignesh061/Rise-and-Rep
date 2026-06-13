import bcrypt
from database.db import get_db


def seed_admin():
    """Create a default admin if the admins collection is empty."""
    db = get_db()
    if db.admins.count_documents({}) == 0:
        hashed = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt())
        db.admins.insert_one({
            "username": "admin",
            "password": hashed,
            "role": "admin",
        })
        print("[seed] Default admin created (admin / admin123)")


def find_admin_by_username(username):
    """Find an admin by username."""
    db = get_db()
    return db.admins.find_one({"username": username})


def verify_admin_password(stored_hash, password):
    """Verify a plain-text password against the admin's bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash)
