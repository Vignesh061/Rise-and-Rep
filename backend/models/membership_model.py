import datetime
from dateutil.relativedelta import relativedelta
from bson import ObjectId
from database.db import get_db


# ══════════════════════════════════════════════════════════════════
#  Seed Data
# ══════════════════════════════════════════════════════════════════

SEED_PACKAGES = [
    {
        "name": "Basic",
        "description": "Perfect for getting started. Full gym access for one month with basic equipment usage.",
        "duration_months": 1,
        "price": 999,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
    },
    {
        "name": "Standard",
        "description": "Commit to your fitness journey. 3 months of full access including group classes. Save 17%.",
        "duration_months": 3,
        "price": 2499,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
    },
    {
        "name": "Premium",
        "description": "Half-year transformation package. Includes personal training sessions and diet consultation. Save 25%.",
        "duration_months": 6,
        "price": 4499,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
    },
    {
        "name": "Elite",
        "description": "Ultimate annual membership. Unlimited access to all facilities, personal training, spa, and priority booking. Best value.",
        "duration_months": 12,
        "price": 7999,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
    },
]


def seed_packages():
    """Populate the packages collection if it is empty."""
    db = get_db()
    if db.packages.count_documents({}) == 0:
        db.packages.insert_many(SEED_PACKAGES)
        print("[seed] Default membership packages created")


# ══════════════════════════════════════════════════════════════════
#  Package CRUD (admin-managed)
# ══════════════════════════════════════════════════════════════════

def get_all_packages(active_only=False):
    """Return all packages, optionally filtering to active-only."""
    db = get_db()
    query = {"status": "active"} if active_only else {}
    packages = list(db.packages.find(query).sort("duration_months", 1))
    for p in packages:
        p["_id"] = str(p["_id"])
        if "created_at" in p and p["created_at"]:
            p["created_at"] = p["created_at"].isoformat()
    return packages


def get_package_count():
    """Return the total number of packages."""
    db = get_db()
    return db.packages.count_documents({})


def find_package_by_id(package_id):
    """Find a single package by ID."""
    db = get_db()
    try:
        pkg = db.packages.find_one({"_id": ObjectId(package_id)})
    except Exception:
        return None
    if pkg:
        pkg["_id"] = str(pkg["_id"])
        if "created_at" in pkg and pkg["created_at"]:
            pkg["created_at"] = pkg["created_at"].isoformat()
    return pkg


def create_package(data):
    """Create a new membership package."""
    db = get_db()
    package = {
        "name": data.get("name"),
        "description": data.get("description", ""),
        "duration_months": int(data.get("duration_months", 1)),
        "price": float(data.get("price", 0)),
        "status": data.get("status", "active"),
        "created_at": datetime.datetime.utcnow(),
    }
    result = db.packages.insert_one(package)
    return str(result.inserted_id)


def update_package(package_id, data):
    """Update a membership package."""
    db = get_db()
    allowed_fields = ["name", "description", "duration_months", "price", "status"]
    update_data = {}
    for k, v in data.items():
        if k in allowed_fields and v is not None:
            if k == "duration_months":
                update_data[k] = int(v)
            elif k == "price":
                update_data[k] = float(v)
            else:
                update_data[k] = v
    if update_data:
        db.packages.update_one({"_id": ObjectId(package_id)}, {"$set": update_data})
    return True


def delete_package(package_id):
    """Delete a package by ID."""
    db = get_db()
    result = db.packages.delete_one({"_id": ObjectId(package_id)})
    return result.deleted_count > 0


def toggle_package_status(package_id):
    """Toggle a package between active and inactive."""
    db = get_db()
    pkg = db.packages.find_one({"_id": ObjectId(package_id)})
    if not pkg:
        return None
    new_status = "inactive" if pkg.get("status") == "active" else "active"
    db.packages.update_one({"_id": ObjectId(package_id)}, {"$set": {"status": new_status}})
    return new_status


# ══════════════════════════════════════════════════════════════════
#  Membership Status Helpers
# ══════════════════════════════════════════════════════════════════

def _calculate_status(end_date):
    """Calculate membership status based on end date vs now."""
    now = datetime.datetime.utcnow()
    if now > end_date:
        return "expired"
    days_remaining = (end_date - now).days
    if days_remaining <= 7:
        return "expiring_soon"
    return "active"


def _days_remaining(end_date):
    """Return days remaining, minimum 0."""
    now = datetime.datetime.utcnow()
    delta = (end_date - now).days
    return max(delta, 0)


def _serialize_membership(m, include_user=False):
    """Serialize a membership document for JSON."""
    data = {
        "_id": str(m["_id"]),
        "user_id": m.get("user_id"),
        "package_id": m.get("package_id"),
        "package_name": m.get("package_name", ""),
        "start_date": m["start_date"].isoformat() if isinstance(m.get("start_date"), datetime.datetime) else m.get("start_date"),
        "end_date": m["end_date"].isoformat() if isinstance(m.get("end_date"), datetime.datetime) else m.get("end_date"),
        "payment_status": m.get("payment_status", "pending"),
        "created_at": m["created_at"].isoformat() if isinstance(m.get("created_at"), datetime.datetime) else m.get("created_at"),
    }

    # Calculate live status and days remaining
    end_dt = m["end_date"] if isinstance(m.get("end_date"), datetime.datetime) else datetime.datetime.fromisoformat(str(m.get("end_date")))
    data["membership_status"] = _calculate_status(end_dt)
    data["days_remaining"] = _days_remaining(end_dt)

    if include_user and "user_info" in m:
        data["user_name"] = m["user_info"].get("name", "Unknown")
        data["user_email"] = m["user_info"].get("email", "")

    return data


# ══════════════════════════════════════════════════════════════════
#  Membership Purchase
# ══════════════════════════════════════════════════════════════════

def purchase_membership(user_id, package_id):
    """
    Purchase a membership for a user.
    - Enforces one active membership at a time.
    - Creates membership, payment, and history records.
    - Simulates successful payment.
    Returns (membership_id, error_message).
    """
    db = get_db()

    # Validate package
    pkg = db.packages.find_one({"_id": ObjectId(package_id)})
    if not pkg:
        return None, "Package not found"
    if pkg.get("status") != "active":
        return None, "Package is not available"

    # Check for existing active membership
    existing = db.memberships.find_one({"user_id": user_id, "payment_status": "paid"})
    if existing:
        end_dt = existing["end_date"]
        if isinstance(end_dt, datetime.datetime) and datetime.datetime.utcnow() <= end_dt:
            return None, "You already have an active membership. Please renew instead."

    # Calculate dates
    now = datetime.datetime.utcnow()
    end_date = now + relativedelta(months=pkg["duration_months"])

    # Create membership
    membership = {
        "user_id": user_id,
        "package_id": str(pkg["_id"]),
        "package_name": pkg["name"],
        "start_date": now,
        "end_date": end_date,
        "membership_status": "active",
        "payment_status": "paid",  # Simulated payment
        "created_at": now,
    }
    mem_result = db.memberships.insert_one(membership)
    mem_id = str(mem_result.inserted_id)

    # Create payment record (simulated)
    payment = {
        "user_id": user_id,
        "membership_id": mem_id,
        "amount": pkg["price"],
        "payment_method": "card_simulation",
        "payment_status": "paid",
        "payment_date": now,
        "created_at": now,
    }
    db.payments.insert_one(payment)

    # Create history record
    history = {
        "user_id": user_id,
        "membership_id": mem_id,
        "package_name": pkg["name"],
        "start_date": now,
        "end_date": end_date,
        "amount_paid": pkg["price"],
        "status": "active",
        "created_at": now,
    }
    db.membership_history.insert_one(history)

    return mem_id, None


# ══════════════════════════════════════════════════════════════════
#  Membership Renewal
# ══════════════════════════════════════════════════════════════════

def renew_membership(user_id, package_id):
    """
    Renew an existing membership.
    - Extends the current end_date by the package duration (does NOT reset).
    - Creates a new payment and history record.
    Returns (membership_id, error_message).
    """
    db = get_db()

    # Validate package
    pkg = db.packages.find_one({"_id": ObjectId(package_id)})
    if not pkg:
        return None, "Package not found"
    if pkg.get("status") != "active":
        return None, "Package is not available"

    # Find existing membership
    existing = db.memberships.find_one(
        {"user_id": user_id, "payment_status": "paid"},
        sort=[("end_date", -1)],
    )

    now = datetime.datetime.utcnow()

    if existing:
        current_end = existing["end_date"]
        if isinstance(current_end, datetime.datetime) and current_end > now:
            # Still active — extend from current end date
            new_end = current_end + relativedelta(months=pkg["duration_months"])
        else:
            # Expired — start fresh from now
            new_end = now + relativedelta(months=pkg["duration_months"])
            current_end = now  # reset start reference

        db.memberships.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "end_date": new_end,
                "package_id": str(pkg["_id"]),
                "package_name": pkg["name"],
                "membership_status": "active",
                "payment_status": "paid",
            }},
        )
        mem_id = str(existing["_id"])
    else:
        # No existing membership — treat as a purchase
        return purchase_membership(user_id, package_id)

    # Create payment record
    payment = {
        "user_id": user_id,
        "membership_id": mem_id,
        "amount": pkg["price"],
        "payment_method": "card_simulation",
        "payment_status": "paid",
        "payment_date": now,
        "created_at": now,
    }
    db.payments.insert_one(payment)

    # Create history record
    history = {
        "user_id": user_id,
        "membership_id": mem_id,
        "package_name": pkg["name"],
        "start_date": now,
        "end_date": new_end,
        "amount_paid": pkg["price"],
        "status": "renewed",
        "created_at": now,
    }
    db.membership_history.insert_one(history)

    return mem_id, None


# ══════════════════════════════════════════════════════════════════
#  User Membership Queries
# ══════════════════════════════════════════════════════════════════

def get_active_membership(user_id):
    """Get the most recent membership for a user with live status calculation."""
    db = get_db()
    membership = db.memberships.find_one(
        {"user_id": user_id},
        sort=[("end_date", -1)],
    )
    if not membership:
        return None

    # Auto-update status in DB if expired
    end_dt = membership["end_date"]
    if isinstance(end_dt, datetime.datetime):
        status = _calculate_status(end_dt)
        if status != membership.get("membership_status"):
            db.memberships.update_one(
                {"_id": membership["_id"]},
                {"$set": {"membership_status": status}},
            )
            membership["membership_status"] = status

    return _serialize_membership(membership)


def get_membership_history(user_id):
    """Return all membership history records for a user."""
    db = get_db()
    records = list(db.membership_history.find({"user_id": user_id}).sort("created_at", -1))
    result = []
    for r in records:
        entry = {
            "_id": str(r["_id"]),
            "membership_id": r.get("membership_id", ""),
            "package_name": r.get("package_name", ""),
            "start_date": r["start_date"].isoformat() if isinstance(r.get("start_date"), datetime.datetime) else r.get("start_date"),
            "end_date": r["end_date"].isoformat() if isinstance(r.get("end_date"), datetime.datetime) else r.get("end_date"),
            "amount_paid": r.get("amount_paid", 0),
            "status": r.get("status", ""),
            "created_at": r["created_at"].isoformat() if isinstance(r.get("created_at"), datetime.datetime) else r.get("created_at"),
        }
        # Fetch payment date
        payment = db.payments.find_one({"membership_id": r.get("membership_id"), "user_id": user_id}, sort=[("payment_date", -1)])
        if payment and isinstance(payment.get("payment_date"), datetime.datetime):
            entry["payment_date"] = payment["payment_date"].isoformat()
        else:
            entry["payment_date"] = entry["created_at"]
        result.append(entry)
    return result


def get_invoice_data(membership_id, user_id):
    """Return invoice data for a given membership."""
    db = get_db()

    try:
        membership = db.memberships.find_one({"_id": ObjectId(membership_id)})
    except Exception:
        return None

    if not membership:
        return None

    # Security: ensure the membership belongs to the user (unless admin)
    if user_id and membership.get("user_id") != user_id:
        return None

    # Get user info
    user = db.users.find_one({"_id": ObjectId(membership["user_id"])})
    user_name = user.get("name", "Unknown") if user else "Unknown"
    user_email = user.get("email", "") if user else ""

    # Get payment
    payment = db.payments.find_one(
        {"membership_id": str(membership["_id"])},
        sort=[("payment_date", -1)],
    )

    invoice = {
        "invoice_number": f"INV-{str(membership['_id'])[-8:].upper()}",
        "membership_id": str(membership["_id"]),
        "user_name": user_name,
        "user_email": user_email,
        "package_name": membership.get("package_name", ""),
        "amount": payment.get("amount", 0) if payment else 0,
        "start_date": membership["start_date"].isoformat() if isinstance(membership.get("start_date"), datetime.datetime) else membership.get("start_date"),
        "end_date": membership["end_date"].isoformat() if isinstance(membership.get("end_date"), datetime.datetime) else membership.get("end_date"),
        "payment_date": payment["payment_date"].isoformat() if payment and isinstance(payment.get("payment_date"), datetime.datetime) else None,
        "payment_status": payment.get("payment_status", "pending") if payment else "pending",
        "payment_method": payment.get("payment_method", "") if payment else "",
    }
    return invoice


# ══════════════════════════════════════════════════════════════════
#  Admin Membership Queries
# ══════════════════════════════════════════════════════════════════

def get_all_memberships_admin(search_query=None, status_filter=None):
    """Return all memberships with user info for admin view."""
    db = get_db()

    pipeline = [
        {
            "$addFields": {
                "user_oid": {"$toObjectId": "$user_id"},
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_oid",
                "foreignField": "_id",
                "as": "user_info",
            }
        },
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {"$sort": {"end_date": -1}},
    ]

    memberships = list(db.memberships.aggregate(pipeline))
    result = []

    for m in memberships:
        serialized = _serialize_membership(m, include_user=True)

        # Apply status filter
        if status_filter and status_filter != "all":
            if serialized["membership_status"] != status_filter:
                continue

        # Apply search filter
        if search_query:
            q = search_query.lower()
            name = serialized.get("user_name", "").lower()
            email = serialized.get("user_email", "").lower()
            if q not in name and q not in email:
                continue

        result.append(serialized)

    return result


def get_expiring_memberships():
    """Return memberships expiring within 7 days."""
    db = get_db()
    now = datetime.datetime.utcnow()
    seven_days = now + datetime.timedelta(days=7)

    pipeline = [
        {
            "$match": {
                "end_date": {"$gt": now, "$lte": seven_days},
                "payment_status": "paid",
            }
        },
        {
            "$addFields": {
                "user_oid": {"$toObjectId": "$user_id"},
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_oid",
                "foreignField": "_id",
                "as": "user_info",
            }
        },
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {"$sort": {"end_date": 1}},
    ]

    memberships = list(db.memberships.aggregate(pipeline))
    return [_serialize_membership(m, include_user=True) for m in memberships]


def get_expired_memberships():
    """Return all expired memberships."""
    db = get_db()
    now = datetime.datetime.utcnow()

    pipeline = [
        {
            "$match": {
                "end_date": {"$lt": now},
                "payment_status": "paid",
            }
        },
        {
            "$addFields": {
                "user_oid": {"$toObjectId": "$user_id"},
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_oid",
                "foreignField": "_id",
                "as": "user_info",
            }
        },
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {"$sort": {"end_date": -1}},
    ]

    memberships = list(db.memberships.aggregate(pipeline))
    return [_serialize_membership(m, include_user=True) for m in memberships]


def get_membership_stats():
    """Return aggregated membership statistics for admin dashboard."""
    db = get_db()
    now = datetime.datetime.utcnow()
    seven_days = now + datetime.timedelta(days=7)

    total = db.memberships.count_documents({"payment_status": "paid"})
    active = db.memberships.count_documents({
        "end_date": {"$gt": seven_days},
        "payment_status": "paid",
    })
    expiring = db.memberships.count_documents({
        "end_date": {"$gt": now, "$lte": seven_days},
        "payment_status": "paid",
    })
    expired = db.memberships.count_documents({
        "end_date": {"$lt": now},
        "payment_status": "paid",
    })

    # Total revenue
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    revenue_result = list(db.payments.aggregate(revenue_pipeline))
    revenue = revenue_result[0]["total"] if revenue_result else 0

    return {
        "total_members": total,
        "active_members": active,
        "expiring_soon": expiring,
        "expired_members": expired,
        "revenue": revenue,
    }


def get_report_data(report_type):
    """Get report data based on type: active, expiring, expired, revenue."""
    db = get_db()
    now = datetime.datetime.utcnow()
    seven_days = now + datetime.timedelta(days=7)

    if report_type == "active":
        pipeline = [
            {"$match": {"end_date": {"$gt": seven_days}, "payment_status": "paid"}},
            {"$addFields": {"user_oid": {"$toObjectId": "$user_id"}}},
            {"$lookup": {"from": "users", "localField": "user_oid", "foreignField": "_id", "as": "user_info"}},
            {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
            {"$sort": {"end_date": -1}},
        ]
        memberships = list(db.memberships.aggregate(pipeline))
        return [_serialize_membership(m, include_user=True) for m in memberships]

    elif report_type == "expiring":
        return get_expiring_memberships()

    elif report_type == "expired":
        return get_expired_memberships()

    elif report_type == "revenue":
        payments = list(db.payments.find({"payment_status": "paid"}).sort("payment_date", -1))
        result = []
        for p in payments:
            user = db.users.find_one({"_id": ObjectId(p["user_id"])}) if p.get("user_id") else None
            result.append({
                "_id": str(p["_id"]),
                "user_name": user.get("name", "Unknown") if user else "Unknown",
                "amount": p.get("amount", 0),
                "payment_method": p.get("payment_method", ""),
                "payment_status": p.get("payment_status", ""),
                "payment_date": p["payment_date"].isoformat() if isinstance(p.get("payment_date"), datetime.datetime) else "",
            })
        return result

    return []
