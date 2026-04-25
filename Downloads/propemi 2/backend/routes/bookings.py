from flask import Blueprint, jsonify, request
from db.connection import query, execute

bookings_bp = Blueprint("bookings", __name__)

@bookings_bp.route("/bookings", methods=["GET"])
def get_bookings():
    status     = request.args.get("status", "")
    search     = request.args.get("search", "")
    date_from  = request.args.get("date_from", "")
    date_to    = request.args.get("date_to", "")

    sql = """
        SELECT b.booking_id, b.booking_date, b.booking_amount, b.status,
               c.customer_name, c.phone AS customer_phone,
               p.property_type, p.price,
               pr.project_name,
               a.agent_name
        FROM Booking b
        JOIN Customer c  ON b.customer_id = c.customer_id
        JOIN Property p  ON b.property_id = p.property_id
        JOIN Project  pr ON p.project_id  = pr.project_id
        LEFT JOIN Agent a ON b.agent_id   = a.agent_id
        WHERE 1=1
    """
    params = []
    if status:
        sql += " AND b.status = %s"; params.append(status)
    if search:
        like = f"%{search}%"
        sql += " AND (c.customer_name LIKE %s OR p.property_type LIKE %s OR a.agent_name LIKE %s)"
        params.extend([like, like, like])
    if date_from:
        sql += " AND b.booking_date >= %s"; params.append(date_from)
    if date_to:
        sql += " AND b.booking_date <= %s"; params.append(date_to)
    sql += " ORDER BY b.booking_date DESC"
    return jsonify(query(sql, params))

@bookings_bp.route("/bookings/<int:bid>", methods=["GET"])
def get_booking_detail(bid):
    """Full drill-down: booking + customer + property + agent + loan + EMIs + payments"""
    booking = query("""
        SELECT b.*, c.customer_name, c.email, c.phone, c.address,
               p.property_type, p.price, p.status AS property_status,
               pr.project_name, pr.location, pr.developer_name,
               a.agent_name, a.phone AS agent_phone, a.commission_rate
        FROM Booking b
        JOIN Customer c  ON b.customer_id = c.customer_id
        JOIN Property p  ON b.property_id = p.property_id
        JOIN Project  pr ON p.project_id  = pr.project_id
        LEFT JOIN Agent a ON b.agent_id   = a.agent_id
        WHERE b.booking_id = %s
    """, (bid,))

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    loans = query("""
        SELECT l.*, 
               COUNT(e.emi_id) AS total_emis,
               SUM(CASE WHEN e.status='PAID' THEN 1 ELSE 0 END) AS paid_emis
        FROM Loan l
        LEFT JOIN EMI_Scheduler e ON l.loan_id = e.loan_id
        WHERE l.booking_id = %s
        GROUP BY l.loan_id
    """, (bid,))

    emis = query("""
        SELECT e.* FROM EMI_Scheduler e
        JOIN Loan l ON e.loan_id = l.loan_id
        WHERE l.booking_id = %s
        ORDER BY e.due_date
    """, (bid,))

    payments = query("SELECT * FROM Payments WHERE booking_id = %s ORDER BY payment_date DESC", (bid,))

    result = booking[0]
    result["loans"]    = loans
    result["emis"]     = emis
    result["payments"] = payments
    return jsonify(result)

@bookings_bp.route("/bookings/<int:bid>/cancel", methods=["POST"])
def cancel_booking(bid):
    try:
        execute("UPDATE Booking SET status='CANCELLED' WHERE booking_id=%s", (bid,))
        return jsonify({"success": True, "message": "Booking cancelled"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
