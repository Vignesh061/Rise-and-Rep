from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client["smart_gym"]


def get_db():
    return db
