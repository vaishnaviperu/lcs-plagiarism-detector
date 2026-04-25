from flask import Blueprint, jsonify, request
from db.connection import query
projects_bp = Blueprint("projects", __name__)
@projects_bp.route("/projects", methods=["GET"])
def get_projects():
    search = request.args.get("search", "")
    if search:
        like = f"%{search}%"
        return jsonify(query("SELECT * FROM Project WHERE project_name LIKE %s OR location LIKE %s ORDER BY project_id", (like, like)))
    return jsonify(query("SELECT * FROM Project ORDER BY project_id"))
