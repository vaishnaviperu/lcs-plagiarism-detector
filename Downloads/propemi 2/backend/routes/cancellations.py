from flask import Blueprint, jsonify
from db.connection import query
cancellations_bp = Blueprint("cancellations", __name__)
@cancellations_bp.route("/cancellations", methods=["GET"])
def get_cancellations():
    return jsonify(query("""
        SELECT cn.cancellation_id, cn.reason, cn.refund_amount,
               b.booking_id, b.booking_date, c.customer_name, p.property_type
        FROM Cancellations cn
        JOIN Booking b ON cn.booking_id = b.booking_id
        JOIN Customer c ON b.customer_id = c.customer_id
        JOIN Property p ON b.property_id = p.property_id
        ORDER BY cn.cancellation_id DESC
    """))
