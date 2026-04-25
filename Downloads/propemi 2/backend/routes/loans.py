from flask import Blueprint, jsonify
from db.connection import query

loans_bp = Blueprint("loans", __name__)

@loans_bp.route("/loans", methods=["GET"])
def get_loans():
    return jsonify(query("""
        SELECT l.loan_id, l.loan_amount, l.interest_rate, l.tenure_months,
               b.booking_id, b.status AS booking_status,
               c.customer_name, p.property_type,
               COUNT(e.emi_id) AS total_emis,
               SUM(CASE WHEN e.status='PAID' THEN 1 ELSE 0 END) AS paid_emis,
               SUM(CASE WHEN e.status='PAID' THEN e.emi_amount ELSE 0 END) AS paid_amount
        FROM Loan l
        JOIN Booking  b ON l.booking_id  = b.booking_id
        JOIN Customer c ON b.customer_id = c.customer_id
        JOIN Property p ON b.property_id = p.property_id
        LEFT JOIN EMI_Scheduler e ON l.loan_id = e.loan_id
        GROUP BY l.loan_id, l.loan_amount, l.interest_rate, l.tenure_months,
                 b.booking_id, b.status, c.customer_name, p.property_type
        ORDER BY l.loan_id
    """))

@loans_bp.route("/loans/<int:lid>/progress", methods=["GET"])
def get_loan_progress(lid):
    result = query("""
        SELECT l.loan_id, l.loan_amount, l.tenure_months,
               COUNT(e.emi_id) AS total_emis,
               SUM(CASE WHEN e.status='PAID' THEN 1 ELSE 0 END) AS paid_emis,
               SUM(CASE WHEN e.status='PAID' THEN e.emi_amount ELSE 0 END) AS paid_amount,
               SUM(e.emi_amount) AS total_amount
        FROM Loan l
        LEFT JOIN EMI_Scheduler e ON l.loan_id = e.loan_id
        WHERE l.loan_id = %s
        GROUP BY l.loan_id
    """, (lid,))
    if not result:
        return jsonify({"error": "Not found"}), 404
    r = result[0]
    r["progress_pct"] = round((r["paid_emis"] / r["total_emis"] * 100) if r["total_emis"] else 0, 1)
    return jsonify(r)
