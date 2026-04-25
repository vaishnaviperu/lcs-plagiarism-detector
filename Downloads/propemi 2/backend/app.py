from flask import Flask
from flask_cors import CORS

from routes.dashboard     import dashboard_bp
from routes.auth          import auth_bp
from routes.customers     import customers_bp
from routes.projects      import projects_bp
from routes.properties    import properties_bp
from routes.bookings      import bookings_bp
from routes.loans         import loans_bp
from routes.emis          import emis_bp
from routes.payments      import payments_bp
from routes.cancellations import cancellations_bp
from routes.agents        import agents_bp
from routes.documents     import documents_bp
from routes.search        import search_bp
from routes.reports       import reports_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(dashboard_bp,     url_prefix="/api")
app.register_blueprint(auth_bp,          url_prefix="/api")
app.register_blueprint(customers_bp,     url_prefix="/api")
app.register_blueprint(projects_bp,      url_prefix="/api")
app.register_blueprint(properties_bp,    url_prefix="/api")
app.register_blueprint(bookings_bp,      url_prefix="/api")
app.register_blueprint(loans_bp,         url_prefix="/api")
app.register_blueprint(emis_bp,          url_prefix="/api")
app.register_blueprint(payments_bp,      url_prefix="/api")
app.register_blueprint(cancellations_bp, url_prefix="/api")
app.register_blueprint(agents_bp,        url_prefix="/api")
app.register_blueprint(documents_bp,     url_prefix="/api")
app.register_blueprint(search_bp,        url_prefix="/api")
app.register_blueprint(reports_bp,       url_prefix="/api")

@app.route("/")
def index():
    return {"message": "PropEMI API v3"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)