import os
from app import create_app
from app.extensions import db

app = create_app(os.getenv('FLASK_ENV') or 'default')

# Auto-create tables on startup (safe to run multiple times)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
