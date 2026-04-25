from flask import Blueprint, jsonify, request
from db.connection import query

search_bp = Blueprint("search", __name__)

@search_bp.route("/search", methods=["GET"])
def global_search():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({})
    like = f"%{q}%"
    try:
        customers = query(
            "SELECT customer_id AS id, customer_name AS name, email AS sub FROM Customer WHERE customer_name LIKE %s OR email LIKE %s LIMIT 4",
            (like, like)
        )
        properties = query(
            "SELECT property_id AS id, property_type AS name, status AS sub FROM Property WHERE property_type LIKE %s OR status LIKE %s LIMIT 4",
            (like, like)
        )
        bookings = query(
            "SELECT b.booking_id AS id, CONCAT('Booking #',b.booking_id) AS name, b.status AS sub FROM Booking b JOIN Customer c ON b.customer_id=c.customer_id WHERE c.customer_name LIKE %s OR b.status LIKE %s LIMIT 4",
            (like, like)
        )
        return jsonify({
            "customers":  customers,
            "properties": properties,
            "bookings":   bookings,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500