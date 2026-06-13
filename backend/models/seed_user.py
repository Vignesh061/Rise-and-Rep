import bcrypt
from database.db import get_db

def seed_test_user():
    db = get_db()
    if db.users.count_documents({"email": "test@example.com"}) == 0:
        hashed = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt())
        db.users.insert_one({
            "name": "Test User",
            "email": "test@example.com",
            "password": hashed,
            "role": "member",
            "status": "active"
        })
        print("[seed] Default test user created (test@example.com / password123)")
