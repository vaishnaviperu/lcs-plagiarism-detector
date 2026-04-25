from flask import Blueprint, jsonify, request
from db.connection import query

agents_bp = Blueprint("agents", __name__)

@agents_bp.route("/agents", methods=["GET"])
def get_agents():
    search = request.args.get("search", "")
    if search:
        like = f"%{search}%"
        return jsonify(query(
            "SELECT * FROM Agent WHERE agent_name LIKE %s OR phone LIKE %s ORDER BY agent_id",
            (like, like)
        ))
    return jsonify(query("SELECT * FROM Agent ORDER BY agent_id"))

@agents_bp.route("/agents/performance", methods=["GET"])
def get_performance():
    return jsonify(query("""
        SELECT a.agent_id, a.agent_name, a.phone, a.commission_rate,
               COUNT(b.booking_id) AS total_bookings,
               COALESCE(SUM(b.booking_amount),0) AS total_amount,
               COALESCE(SUM(b.booking_amount * a.commission_rate / 100),0) AS commission_earned
        FROM Agent a
        LEFT JOIN Booking b ON a.agent_id = b.agent_id AND b.status != 'CANCELLED'
        GROUP BY a.agent_id
        ORDER BY total_bookings DESC
    """))