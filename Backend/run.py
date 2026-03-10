import os
from app import create_app
from app.extensions import db

app = create_app(os.getenv('FLASK_ENV') or 'default')

if __name__ == '__main__':
    with app.app_context():
        # Create tables automatically for SQLite local dev without migrations
        db.create_all()
    app.run(host='0.0.0.0', port=5001)
