from flask import Blueprint, jsonify
from db.connection import query

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/summary", methods=["GET"])
def get_summary():
    try:
        return jsonify({
            "total_customers":  query("SELECT COUNT(*) AS cnt FROM Customer")[0]["cnt"],
            "total_properties": query("SELECT COUNT(*) AS cnt FROM Property")[0]["cnt"],
            "total_bookings":   query("SELECT COUNT(*) AS cnt FROM Booking")[0]["cnt"],
            "total_loans":      query("SELECT COUNT(*) AS cnt FROM Loan")[0]["cnt"],
            "total_payments":   query("SELECT COUNT(*) AS cnt FROM Payments")[0]["cnt"],
            "total_agents":     query("SELECT COUNT(*) AS cnt FROM Agent")[0]["cnt"],
            "total_projects":   query("SELECT COUNT(*) AS cnt FROM Project")[0]["cnt"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route("/dashboard/analytics", methods=["GET"])
def get_analytics():
    try:
        revenue_trend = query("""
            SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month,
                   SUM(amount) AS total_revenue
            FROM Payments WHERE payment_date IS NOT NULL
            GROUP BY month ORDER BY month LIMIT 12
        """)
        bookings_trend = query("""
            SELECT DATE_FORMAT(booking_date,'%Y-%m') AS month,
                   COUNT(*) AS total_bookings
            FROM Booking WHERE booking_date IS NOT NULL
            GROUP BY month ORDER BY month LIMIT 12
        """)
        property_status = query("SELECT status, COUNT(*) AS count FROM Property GROUP BY status")
        top_agent = query("""
            SELECT a.agent_name, COUNT(b.booking_id) AS total_bookings
            FROM Agent a JOIN Booking b ON a.agent_id=b.agent_id
            GROUP BY a.agent_id ORDER BY total_bookings DESC LIMIT 1
        """)
        popular_type = query("""
            SELECT p.property_type, COUNT(b.booking_id) AS bookings
            FROM Property p JOIN Booking b ON p.property_id=b.property_id
            GROUP BY p.property_type ORDER BY bookings DESC LIMIT 1
        """)
        revenue_this_month = query("""
            SELECT COALESCE(SUM(amount),0) AS total FROM Payments
            WHERE MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())
        """)
        overdue_emis = query("SELECT COUNT(*) AS cnt FROM EMI_Scheduler WHERE status='UNPAID' AND due_date < CURDATE()")
        return jsonify({
            "revenue_trend":      revenue_trend,
            "bookings_trend":     bookings_trend,
            "property_status":    property_status,
            "top_agent":          top_agent[0] if top_agent else {},
            "popular_type":       popular_type[0] if popular_type else {},
            "revenue_this_month": float(revenue_this_month[0]["total"]),
            "overdue_emis":       overdue_emis[0]["cnt"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route("/dashboard/activity", methods=["GET"])
def get_activity():
    try:
        bookings = query("""
            SELECT 'booking' AS type, b.booking_date AS date,
                   CONCAT(c.customer_name,' booked a ',p.property_type) AS text
            FROM Booking b
            JOIN Customer c ON b.customer_id=c.customer_id
            JOIN Property p ON b.property_id=p.property_id
            ORDER BY b.booking_date DESC LIMIT 5
        """)
        payments = query("""
            SELECT 'payment' AS type, pay.payment_date AS date,
                   CONCAT(c.customer_name,' paid ',pay.amount) AS text
            FROM Payments pay
            JOIN Booking b ON pay.booking_id=b.booking_id
            JOIN Customer c ON b.customer_id=c.customer_id
            ORDER BY pay.payment_date DESC LIMIT 5
        """)
        cancels = query("""
            SELECT 'cancel' AS type, b.booking_date AS date,
                   CONCAT(c.customer_name,' cancelled booking #',b.booking_id) AS text
            FROM Cancellations cn
            JOIN Booking b ON cn.booking_id=b.booking_id
            JOIN Customer c ON b.customer_id=c.customer_id
            ORDER BY b.booking_date DESC LIMIT 3
        """)
        combined = sorted(bookings + payments + cancels, key=lambda x: str(x["date"] or ""), reverse=True)
        return jsonify(combined[:12])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route("/dashboard/notifications", methods=["GET"])
def get_notifications():
    try:
        overdue = query("""
            SELECT CONCAT(c.customer_name,' has overdue EMI of ',e.emi_amount,' due ',e.due_date) AS message,
                   'overdue' AS type
            FROM EMI_Scheduler e
            JOIN Loan l ON e.loan_id=l.loan_id
            JOIN Booking b ON l.booking_id=b.booking_id
            JOIN Customer c ON b.customer_id=c.customer_id
            WHERE e.status='UNPAID' AND e.due_date < CURDATE()
            LIMIT 5
        """)
        cancelled = query("""
            SELECT CONCAT('Booking #',b.booking_id,' by ',c.customer_name,' was cancelled') AS message,
                   'cancelled' AS type
            FROM Cancellations cn
            JOIN Booking b ON cn.booking_id=b.booking_id
            JOIN Customer c ON b.customer_id=c.customer_id
            LIMIT 3
        """)
        return jsonify(overdue + cancelled)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route("/dashboard/kpis", methods=["GET"])
def get_kpis():
    try:
        total_revenue = query("SELECT COALESCE(SUM(amount),0) AS v FROM Payments")[0]["v"]
        pending_emi   = query("SELECT COALESCE(SUM(emi_amount),0) AS v FROM EMI_Scheduler WHERE status='UNPAID'")[0]["v"]
        cancelled     = query("SELECT COUNT(*) AS v FROM Booking WHERE status='CANCELLED'")[0]["v"]
        available     = query("SELECT COUNT(*) AS v FROM Property WHERE status='AVAILABLE'")[0]["v"]
        rev_month     = query("""
            SELECT COALESCE(SUM(amount),0) AS v FROM Payments
            WHERE MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())
        """)[0]["v"]
        rev_last = query("""
            SELECT COALESCE(SUM(amount),0) AS v FROM Payments
            WHERE MONTH(payment_date)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
            AND YEAR(payment_date)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
        """)[0]["v"]
        change = 0
        if rev_last and rev_last > 0:
            change = round(((float(rev_month) - float(rev_last)) / float(rev_last)) * 100, 1)
        return jsonify({
            "total_revenue":  float(total_revenue),
            "pending_emi":    float(pending_emi),
            "cancelled":      int(cancelled),
            "available":      int(available),
            "revenue_change": change,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500