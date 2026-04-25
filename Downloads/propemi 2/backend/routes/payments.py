from flask import Blueprint, jsonify
from db.connection import query
payments_bp = Blueprint("payments", __name__)
@payments_bp.route("/payments", methods=["GET"])
def get_payments():
    return jsonify(query("""
        SELECT pay.payment_id, pay.amount, pay.payment_date, pay.payment_type,
               b.booking_id, c.customer_name, p.property_type
        FROM Payments pay
        JOIN Booking b ON pay.booking_id = b.booking_id
        JOIN Customer c ON b.customer_id = c.customer_id
        JOIN Property p ON b.property_id = p.property_id
        ORDER BY pay.payment_date DESC
    """))
