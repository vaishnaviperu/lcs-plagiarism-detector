from flask import Blueprint, jsonify
from db.connection import query

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/reports/bookings", methods=["GET"])
def report_bookings():
    return jsonify(query("""
        SELECT b.booking_id, c.customer_name, p.property_type,
               pr.project_name, a.agent_name,
               b.booking_date, b.booking_amount, b.status
        FROM Booking b
        JOIN Customer c ON b.customer_id=c.customer_id
        JOIN Property p ON b.property_id=p.property_id
        JOIN Project pr ON p.project_id=pr.project_id
        LEFT JOIN Agent a ON b.agent_id=a.agent_id
        ORDER BY b.booking_date DESC
    """))

@reports_bp.route("/reports/emi", methods=["GET"])
def report_emi():
    return jsonify(query("""
        SELECT e.emi_id, c.customer_name, p.property_type,
               e.due_date, e.emi_amount, e.status,
               l.loan_amount, l.interest_rate
        FROM EMI_Scheduler e
        JOIN Loan l ON e.loan_id=l.loan_id
        JOIN Booking b ON l.booking_id=b.booking_id
        JOIN Customer c ON b.customer_id=c.customer_id
        JOIN Property p ON b.property_id=p.property_id
        ORDER BY e.due_date
    """))

@reports_bp.route("/reports/property", methods=["GET"])
def report_property():
    return jsonify(query("""
        SELECT p.property_id, pr.project_name, p.property_type,
               p.price, p.status,
               COUNT(b.booking_id) AS total_bookings
        FROM Property p
        JOIN Project pr ON p.project_id=pr.project_id
        LEFT JOIN Booking b ON p.property_id=b.property_id
        GROUP BY p.property_id
        ORDER BY p.property_id
    """))

@reports_bp.route("/reports/revenue", methods=["GET"])
def report_revenue():
    return jsonify(query("""
        SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month,
               COUNT(*) AS transactions,
               SUM(amount) AS total_revenue,
               AVG(amount) AS avg_payment
        FROM Payments
        WHERE payment_date IS NOT NULL
        GROUP BY month ORDER BY month
    """))