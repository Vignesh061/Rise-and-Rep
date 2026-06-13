import datetime
import secrets
from bson import ObjectId
from database.db import get_db
from config import Config


def create_reset_token(user_id):
    """Generate a secure reset token and store it with an expiry."""
    db = get_db()
    token = secrets.token_urlsafe(32)
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=Config.RESET_TOKEN_EXPIRY_HOURS)

    # Remove any existing tokens for this user
    db.password_reset_tokens.delete_many({"user_id": str(user_id)})

    db.password_reset_tokens.insert_one({
        "user_id": str(user_id),
        "token": token,
        "expiry": expiry,
    })
    return token


def find_valid_token(token):
    """Find a non-expired reset token."""
    db = get_db()
    record = db.password_reset_tokens.find_one({
        "token": token,
        "expiry": {"$gt": datetime.datetime.utcnow()},
    })
    return record


def delete_token(token):
    """Remove a used reset token."""
    db = get_db()
    db.password_reset_tokens.delete_one({"token": token})
