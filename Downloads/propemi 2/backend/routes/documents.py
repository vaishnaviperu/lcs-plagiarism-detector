from flask import Blueprint, jsonify
from db.connection import query
documents_bp = Blueprint("documents", __name__)
@documents_bp.route("/documents", methods=["GET"])
def get_documents():
    return jsonify(query("""
        SELECT d.document_id, d.document_type, d.file_path, d.uploaded_on, c.customer_name
        FROM Document d
        JOIN Customer c ON d.customer_id = c.customer_id
        ORDER BY d.uploaded_on DESC
    """))
