import jwt
import datetime
from config import Config


def encode_token(user_id, role):
    """Generate a JWT token for the given user."""
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token):
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
