import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config

# Import blueprints
from routes.auth_routes import auth_bp
from routes.workout_routes import workout_bp
from routes.membership_routes import membership_bp
from routes.trainer_routes import trainer_bp

# Seed data
from models.trainer_model import seed_trainers


def create_app():
    # In production, serve the built React frontend
    static_folder = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
    app = Flask(__name__, static_folder=static_folder, static_url_path='')
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(workout_bp)
    app.register_blueprint(membership_bp)
    app.register_blueprint(trainer_bp)

    # Seed trainers on first launch
    with app.app_context():
        seed_trainers()

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        # Serve React app for client-side routes (SPA fallback)
        if os.path.exists(os.path.join(static_folder, 'index.html')):
            return send_from_directory(static_folder, 'index.html')
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500

    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    # Serve React index.html for root
    @app.route("/")
    def serve_react():
        if os.path.exists(os.path.join(static_folder, 'index.html')):
            return send_from_directory(static_folder, 'index.html')
        return {"message": "Rise-and-Rep API is running"}, 200

    return app


# Create app instance (used by gunicorn: `gunicorn app:app`)
app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)
