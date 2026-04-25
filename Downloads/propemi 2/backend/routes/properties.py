from flask import Blueprint, jsonify, request
from db.connection import query

properties_bp = Blueprint("properties", __name__)

@properties_bp.route("/properties", methods=["GET"])
def get_properties():
    search    = request.args.get("search", "")
    min_price = request.args.get("min_price", "")
    max_price = request.args.get("max_price", "")
    prop_type = request.args.get("property_type", "")

    sql = """
        SELECT p.*, pr.project_name FROM Property p
        JOIN Project pr ON p.project_id = pr.project_id
        WHERE 1=1
    """
    params = []
    if search:
        like = f"%{search}%"
        sql += " AND (p.property_type LIKE %s OR p.status LIKE %s)"
        params.extend([like, like])
    if prop_type:
        sql += " AND p.property_type LIKE %s"
        params.append(f"%{prop_type}%")
    if min_price:
        sql += " AND p.price >= %s"
        params.append(float(min_price))
    if max_price:
        sql += " AND p.price <= %s"
        params.append(float(max_price))
    sql += " ORDER BY p.property_id"
    return jsonify(query(sql, params))
