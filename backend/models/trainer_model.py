import datetime
from bson import ObjectId
from database.db import get_db


# Seed trainers if collection is empty
SEED_TRAINERS = [
    {
        "name": "Alex Johnson",
        "specialization": "Strength Training",
        "experience": 8,
        "mobile": "9876543210",
        "email": "alex.johnson@riseandnrep.com",
        "rating": 4.9,
        "bio": "Certified strength and conditioning specialist with 8 years of experience helping clients build muscle and improve performance.",
        "available": True,
    },
    {
        "name": "Sarah Williams",
        "specialization": "Yoga",
        "experience": 6,
        "mobile": "9876543211",
        "email": "sarah.williams@riseandrep.com",
        "rating": 4.8,
        "bio": "Registered yoga teacher specializing in Vinyasa and restorative yoga for stress relief and flexibility.",
        "available": True,
    },
    {
        "name": "Mike Chen",
        "specialization": "Cardio",
        "experience": 5,
        "mobile": "9876543212",
        "email": "mike.chen@riseandrep.com",
        "rating": 4.7,
        "bio": "High-intensity interval training expert focused on fat loss and cardiovascular fitness.",
        "available": True,
    },
    {
        "name": "Emma Davis",
        "specialization": "Weight Loss",
        "experience": 7,
        "mobile": "9876543213",
        "email": "emma.davis@riseandrep.com",
        "rating": 4.9,
        "bio": "Sports nutritionist and personal trainer helping clients achieve sustainable weight management.",
        "available": True,
    },
    {
        "name": "James Rodriguez",
        "specialization": "CrossFit",
        "experience": 4,
        "mobile": "9876543214",
        "email": "james.rodriguez@riseandrep.com",
        "rating": 4.6,
        "bio": "CrossFit Level 2 trainer passionate about functional fitness and competitive training.",
        "available": True,
    },
]


def seed_trainers():
    """Populate the trainers collection if it is empty."""
    db = get_db()
    if db.trainers.count_documents({}) == 0:
        db.trainers.insert_many(SEED_TRAINERS)
        print("[seed] Default trainers created")


def get_all_trainers():
    """Return all trainers."""
    db = get_db()
    trainers = list(db.trainers.find())
    for t in trainers:
        t["_id"] = str(t["_id"])
    return trainers


def get_trainer_count():
    """Return the total number of trainers."""
    db = get_db()
    return db.trainers.count_documents({})


def find_trainer_by_id(trainer_id):
    """Find a single trainer by ID."""
    db = get_db()
    trainer = db.trainers.find_one({"_id": ObjectId(trainer_id)})
    if trainer:
        trainer["_id"] = str(trainer["_id"])
    return trainer


def create_trainer(data):
    """Create a new trainer."""
    db = get_db()
    trainer = {
        "name": data.get("name"),
        "specialization": data.get("specialization"),
        "experience": data.get("experience"),
        "mobile": data.get("mobile"),
        "email": data.get("email"),
        "rating": data.get("rating", 0),
        "bio": data.get("bio", ""),
        "available": True,
    }
    result = db.trainers.insert_one(trainer)
    return str(result.inserted_id)


def update_trainer(trainer_id, data):
    """Update trainer fields."""
    db = get_db()
    allowed_fields = ["name", "specialization", "experience", "mobile", "email", "bio", "available", "rating"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    if update_data:
        db.trainers.update_one({"_id": ObjectId(trainer_id)}, {"$set": update_data})
    return True


def delete_trainer(trainer_id):
    """Delete a trainer by ID."""
    db = get_db()
    result = db.trainers.delete_one({"_id": ObjectId(trainer_id)})
    return result.deleted_count > 0


def book_trainer(user_id, trainer_id, date, time_slot):
    """Book a session with a trainer."""
    db = get_db()
    booking = {
        "user_id": user_id,
        "trainer_id": trainer_id,
        "date": date,
        "time_slot": time_slot,
        "status": "confirmed",
        "created_at": datetime.datetime.utcnow(),
    }
    result = db.bookings.insert_one(booking)
    return str(result.inserted_id)


def get_bookings_by_user(user_id):
    """Get all bookings for a user."""
    db = get_db()
    bookings = list(db.bookings.find({"user_id": user_id}).sort("created_at", -1))
    for b in bookings:
        b["_id"] = str(b["_id"])
        b["created_at"] = b["created_at"].isoformat()
        # Attach trainer name
        trainer = db.trainers.find_one({"_id": ObjectId(b["trainer_id"])})
        b["trainer_name"] = trainer["name"] if trainer else "Unknown"
    return bookings


def get_all_bookings():
    """Return all bookings (admin)."""
    db = get_db()
    bookings = list(db.bookings.find().sort("created_at", -1))
    for b in bookings:
        b["_id"] = str(b["_id"])
        b["created_at"] = b["created_at"].isoformat()
        trainer = db.trainers.find_one({"_id": ObjectId(b["trainer_id"])})
        b["trainer_name"] = trainer["name"] if trainer else "Unknown"
    return bookings
