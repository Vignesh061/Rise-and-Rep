import csv
import io
from flask import Blueprint, request, jsonify, Response
from models.membership_model import (
    # Package CRUD
    get_all_packages,
    find_package_by_id,
    create_package,
    update_package,
    delete_package,
    toggle_package_status,
    get_package_count,
    # User membership
    purchase_membership,
    renew_membership,
    get_active_membership,
    get_membership_history,
    get_invoice_data,
    # Admin membership
    get_all_memberships_admin,
    get_expiring_memberships,
    get_expired_memberships,
    get_membership_stats,
    get_report_data,
)
from middleware.auth_middleware import token_required, admin_required

membership_bp = Blueprint("memberships", __name__, url_prefix="/api/memberships")


# ══════════════════════════════════════════════════════════════════
#  Package Endpoints (public listing, admin CRUD)
# ══════════════════════════════════════════════════════════════════

@membership_bp.route("/packages", methods=["GET"])
def list_packages():
    """List packages. Public users see active-only; admins see all."""
    # Check if admin (optional token)
    is_admin = False
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        from utils.jwt_handler import decode_token
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("role") == "admin":
            is_admin = True

    packages = get_all_packages(active_only=not is_admin)
    return jsonify(packages), 200


@membership_bp.route("/packages/<package_id>", methods=["GET"])
def get_package(package_id):
    pkg = find_package_by_id(package_id)
    if not pkg:
        return jsonify({"error": "Package not found"}), 404
    return jsonify(pkg), 200


@membership_bp.route("/packages", methods=["POST"])
@admin_required
def add_package():
    data = request.get_json()
    name = data.get("name")
    duration_months = data.get("duration_months")
    price = data.get("price")

    if not all([name, duration_months, price]):
        return jsonify({"error": "Name, duration, and price are required"}), 400

    pkg_id = create_package(data)
    return jsonify({"id": pkg_id, "message": "Package created successfully"}), 201


@membership_bp.route("/packages/<package_id>", methods=["PUT"])
@admin_required
def edit_package(package_id):
    data = request.get_json()
    pkg = find_package_by_id(package_id)
    if not pkg:
        return jsonify({"error": "Package not found"}), 404
    update_package(package_id, data)
    updated = find_package_by_id(package_id)
    return jsonify({"message": "Package updated", "package": updated}), 200


@membership_bp.route("/packages/<package_id>", methods=["DELETE"])
@admin_required
def remove_package(package_id):
    deleted = delete_package(package_id)
    if not deleted:
        return jsonify({"error": "Package not found"}), 404
    return jsonify({"message": "Package deleted"}), 200


@membership_bp.route("/packages/<package_id>/toggle", methods=["PATCH"])
@admin_required
def toggle_package(package_id):
    new_status = toggle_package_status(package_id)
    if new_status is None:
        return jsonify({"error": "Package not found"}), 404
    return jsonify({"message": f"Package is now {new_status}", "status": new_status}), 200


# ══════════════════════════════════════════════════════════════════
#  User Membership Endpoints
# ══════════════════════════════════════════════════════════════════

@membership_bp.route("/purchase", methods=["POST"])
@token_required
def purchase():
    """Purchase a membership package."""
    data = request.get_json()
    package_id = data.get("package_id")

    if not package_id:
        return jsonify({"error": "Package ID is required"}), 400

    mem_id, error = purchase_membership(request.user_id, package_id)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "membership_id": mem_id,
        "message": "Membership purchased successfully! Payment confirmed.",
    }), 201


@membership_bp.route("/renew", methods=["POST"])
@token_required
def renew():
    """Renew an existing membership."""
    data = request.get_json()
    package_id = data.get("package_id")

    if not package_id:
        return jsonify({"error": "Package ID is required"}), 400

    mem_id, error = renew_membership(request.user_id, package_id)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "membership_id": mem_id,
        "message": "Membership renewed successfully!",
    }), 200


@membership_bp.route("/my-membership", methods=["GET"])
@token_required
def my_membership():
    """Get the current user's active membership."""
    membership = get_active_membership(request.user_id)
    if not membership:
        return jsonify({"message": "No membership found"}), 200
    return jsonify(membership), 200


@membership_bp.route("/history", methods=["GET"])
@token_required
def membership_history():
    """Get the current user's membership history."""
    history = get_membership_history(request.user_id)
    return jsonify(history), 200


@membership_bp.route("/invoice/<membership_id>", methods=["GET"])
@token_required
def invoice(membership_id):
    """Get invoice data for a specific membership."""
    # Admin can view any invoice; users can only view their own
    user_id = None if request.user_role == "admin" else request.user_id
    data = get_invoice_data(membership_id, user_id)
    if not data:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify(data), 200


# ══════════════════════════════════════════════════════════════════
#  Admin Membership Endpoints
# ══════════════════════════════════════════════════════════════════

@membership_bp.route("/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    """Get membership statistics for admin dashboard."""
    stats = get_membership_stats()
    stats["total_packages"] = get_package_count()
    return jsonify(stats), 200


@membership_bp.route("/admin/members", methods=["GET"])
@admin_required
def admin_members():
    """Get all members with membership info. Supports ?q= search and ?status= filter."""
    q = request.args.get("q", "").strip()
    status = request.args.get("status", "").strip()
    members = get_all_memberships_admin(
        search_query=q if q else None,
        status_filter=status if status else None,
    )
    return jsonify(members), 200


@membership_bp.route("/admin/expiring", methods=["GET"])
@admin_required
def admin_expiring():
    """Get memberships expiring within 7 days."""
    members = get_expiring_memberships()
    return jsonify(members), 200


@membership_bp.route("/admin/expired", methods=["GET"])
@admin_required
def admin_expired():
    """Get all expired memberships."""
    members = get_expired_memberships()
    return jsonify(members), 200


@membership_bp.route("/admin/reports", methods=["GET"])
@admin_required
def admin_reports():
    """Get report data. ?type=active|expiring|expired|revenue"""
    report_type = request.args.get("type", "active").strip()
    data = get_report_data(report_type)
    return jsonify(data), 200


@membership_bp.route("/admin/reports/csv", methods=["GET"])
@admin_required
def admin_reports_csv():
    """Export report data as CSV. ?type=active|expiring|expired|revenue"""
    report_type = request.args.get("type", "active").strip()
    data = get_report_data(report_type)

    if not data:
        return Response("No data", mimetype="text/csv", status=200)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=report_{report_type}.csv",
        },
    )


# ══════════════════════════════════════════════════════════════════
#  Legacy Compatibility — keep old /plans endpoint working
# ══════════════════════════════════════════════════════════════════

@membership_bp.route("/plans", methods=["GET"])
def list_plans_legacy():
    """Legacy endpoint — redirects to packages."""
    packages = get_all_packages(active_only=True)
    return jsonify(packages), 200
