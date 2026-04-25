from flask import Blueprint, jsonify, request
from db.connection import query

customers_bp = Blueprint("customers", __name__)

@customers_bp.route("/customers", methods=["GET"])
def get_customers():
    search = request.args.get("search", "")
    if search:
        like = f"%{search}%"
        return jsonify(query(
            "SELECT * FROM Customer WHERE customer_name LIKE %s OR email LIKE %s OR phone LIKE %s ORDER BY customer_id",
            (like, like, like)
        ))
    return jsonify(query("SELECT * FROM Customer ORDER BY customer_id"))

@customers_bp.route("/customers/<int:cid>/profile", methods=["GET"])
def get_profile(cid):
    customer = query("SELECT * FROM Customer WHERE customer_id=%s", (cid,))
    if not customer:
        return jsonify({"error": "Not found"}), 404
    bookings = query("""
        SELECT b.booking_id, b.booking_date, b.booking_amount, b.status,
               p.property_type, pr.project_name
        FROM Booking b
        JOIN Property p ON b.property_id=p.property_id
        JOIN Project pr ON p.project_id=pr.project_id
        WHERE b.customer_id=%s ORDER BY b.booking_date DESC
    """, (cid,))
    payments = query("""
        SELECT pay.payment_id, pay.amount, pay.payment_date, pay.payment_type
        FROM Payments pay
        JOIN Booking b ON pay.booking_id=b.booking_id
        WHERE b.customer_id=%s ORDER BY pay.payment_date DESC LIMIT 10
    """, (cid,))
    emis = query("""
        SELECT e.emi_id, e.due_date, e.emi_amount, e.status
        FROM EMI_Scheduler e
        JOIN Loan l ON e.loan_id=l.loan_id
        JOIN Booking b ON l.booking_id=b.booking_id
        WHERE b.customer_id=%s ORDER BY e.due_date LIMIT 10
    """, (cid,))
    documents = query("SELECT * FROM Document WHERE customer_id=%s", (cid,))
    result = customer[0]
    result["bookings"]  = bookings
    result["payments"]  = payments
    result["emis"]      = emis
    result["documents"] = documents
    return jsonify(result)