from flask import Blueprint, jsonify, request
from db.connection import query

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Try exact match first
    rows = query(
        "SELECT * FROM User_Logic WHERE username = %s AND password = %s",
        (username, password)
    )

    # If no match, try case-insensitive username match and show what's wrong
    if not rows:
        user_exists = query("SELECT * FROM User_Logic WHERE LOWER(username) = LOWER(%s)", (username,))
        if user_exists:
            return jsonify({"error": "Wrong password"}), 401
        return jsonify({"error": "User not found"}), 401

    user = rows[0]
    return jsonify({
        "user_id":  user["user_id"],
        "username": user["username"],
        "role":     user["role"]
    })

@auth_bp.route("/auth/users", methods=["GET"])
def list_users():
    """Debug endpoint — remove after demo"""
    rows = query("SELECT user_id, username, role FROM User_Logic")
    return jsonify(rows)