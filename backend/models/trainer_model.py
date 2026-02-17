import datetime
from bson import ObjectId
from database.db import get_db


# Seed trainers if collection is empty
SEED_TRAINERS = [
    {
        "name": "Alex Johnson",
        "specialty": "Strength Training",
        "experience": 8,
        "rating": 4.9,
        "bio": "Certified strength and conditioning specialist with 8 years of experience helping clients build muscle and improve performance.",
        "available": True,
    },
    {
        "name": "Sarah Williams",
        "specialty": "Yoga & Flexibility",
        "experience": 6,
        "rating": 4.8,
        "bio": "Registered yoga teacher specializing in Vinyasa and restorative yoga for stress relief and flexibility.",
        "available": True,
    },
    {
        "name": "Mike Chen",
        "specialty": "HIIT & Cardio",
        "experience": 5,
        "rating": 4.7,
        "bio": "High-intensity interval training expert focused on fat loss and cardiovascular fitness.",
        "available": True,
    },
    {
        "name": "Emma Davis",
        "specialty": "Nutrition & Weight Loss",
        "experience": 7,
        "rating": 4.9,
        "bio": "Sports nutritionist and personal trainer helping clients achieve sustainable weight management.",
        "available": True,
    },
    {
        "name": "James Rodriguez",
        "specialty": "CrossFit",
        "experience": 4,
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


def get_all_trainers():
    """Return all trainers."""
    db = get_db()
    trainers = list(db.trainers.find())
    for t in trainers:
        t["_id"] = str(t["_id"])
    return trainers


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
