import datetime
from bson import ObjectId
from database.db import get_db


def create_membership(user_id, plan, duration_days=30):
    """Create a membership for a user."""
    db = get_db()
    start = datetime.datetime.utcnow()
    expiry = start + datetime.timedelta(days=duration_days)
    membership = {
        "user_id": user_id,
        "plan": plan,
        "start_date": start,
        "expiry_date": expiry,
        "status": "active",
    }
    result = db.memberships.insert_one(membership)
    return str(result.inserted_id)


def get_membership_by_user(user_id):
    """Get the active membership for a user."""
    db = get_db()
    membership = db.memberships.find_one(
        {"user_id": user_id, "status": "active"},
        sort=[("expiry_date", -1)],
    )
    if membership:
        membership["_id"] = str(membership["_id"])
        membership["start_date"] = membership["start_date"].isoformat()
        membership["expiry_date"] = membership["expiry_date"].isoformat()
        # Auto-expire
        if datetime.datetime.utcnow() > datetime.datetime.fromisoformat(
            membership["expiry_date"]
        ):
            membership["status"] = "expired"
            db.memberships.update_one(
                {"_id": ObjectId(membership["_id"])},
                {"$set": {"status": "expired"}},
            )
    return membership


def get_all_memberships():
    """Return all memberships (admin)."""
    db = get_db()
    memberships = list(db.memberships.find().sort("expiry_date", -1))
    for m in memberships:
        m["_id"] = str(m["_id"])
        m["start_date"] = m["start_date"].isoformat()
        m["expiry_date"] = m["expiry_date"].isoformat()
    return memberships
