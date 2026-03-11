import os
from flask import Flask, jsonify
from config import config
from app.extensions import db, migrate, jwt, cors

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # Allow all origins — Vercel generates unique preview URLs per deploy
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.workouts import workouts_bp
    from app.routes.progress import progress_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(workouts_bp, url_prefix='/api/workouts')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')

    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "ok", "message": "LH Fit Hub API is running."})

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app
