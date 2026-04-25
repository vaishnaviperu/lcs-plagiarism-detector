from flask import Blueprint, jsonify, request
from db.connection import query, execute
from datetime import date, timedelta

emis_bp = Blueprint("emis", __name__)

@emis_bp.route("/emis", methods=["GET"])
def get_emis():
    status = request.args.get("status", "")
    sql = """
        SELECT e.emi_id, e.due_date, e.emi_amount, e.status AS emi_status,
               l.loan_id, l.loan_amount,
               c.customer_name, p.property_type,
               CASE
                   WHEN e.status='UNPAID' AND e.due_date < CURDATE() THEN 'OVERDUE'
                   WHEN e.status='UNPAID' AND e.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'DUE_SOON'
                   ELSE e.status
               END AS alert_status
        FROM EMI_Scheduler e
        JOIN Loan     l ON e.loan_id     = l.loan_id
        JOIN Booking  b ON l.booking_id  = b.booking_id
        JOIN Customer c ON b.customer_id = c.customer_id
        JOIN Property p ON b.property_id = p.property_id
    """
    if status == "OVERDUE":
        sql += " WHERE e.status='UNPAID' AND e.due_date < CURDATE()"
    elif status == "DUE_SOON":
        sql += " WHERE e.status='UNPAID' AND e.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)"
    elif status:
        sql += f" WHERE e.status = '{status}'"
    sql += " ORDER BY e.due_date"
    return jsonify(query(sql))

@emis_bp.route("/emis/overdue", methods=["GET"])
def get_overdue():
    return jsonify(query("""
        SELECT e.emi_id, e.due_date, e.emi_amount,
               c.customer_name, p.property_type,
               DATEDIFF(CURDATE(), e.due_date) AS days_overdue
        FROM EMI_Scheduler e
        JOIN Loan     l ON e.loan_id     = l.loan_id
        JOIN Booking  b ON l.booking_id  = b.booking_id
        JOIN Customer c ON b.customer_id = c.customer_id
        JOIN Property p ON b.property_id = p.property_id
        WHERE e.status = 'UNPAID' AND e.due_date < CURDATE()
        ORDER BY e.due_date
    """))

@emis_bp.route("/emis/<int:eid>/pay", methods=["POST"])
def mark_paid(eid):
    try:
        execute("UPDATE EMI_Scheduler SET status='PAID' WHERE emi_id=%s", (eid,))
        return jsonify({"success": True, "message": "EMI marked as paid"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
