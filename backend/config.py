import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_gym")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-gym-key")
    PORT = int(os.getenv("PORT", 5000))
    RESET_TOKEN_EXPIRY_HOURS = int(os.getenv("RESET_TOKEN_EXPIRY_HOURS", 1))
