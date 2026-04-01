import os
from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app(os.getenv('FLASK_ENV') or 'default')

# Auto-create tables on startup (safe to run multiple times)
with app.app_context():
    db.create_all()

    # Auto-migrate the existing live database on Render to add the new column
    try:
        from sqlalchemy import text
        db.session.execute(text('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;'))
        db.session.commit()
        print("🚀 Successfully added is_active column to the database schema!")
    except Exception as e:
        db.session.rollback() # Column already exists, safe to ignore

    # Seed superadmin on first deploy if no users exist
    if User.query.count() == 0:
        print("🌱 No users found — seeding initial superadmin...")
        superadmin = User(username='superadmin', phone='0500000000', role='superadmin')
        superadmin.set_password('admin123!@#')
        db.session.add(superadmin)
        db.session.commit()
        print("✅ Superadmin created: username=superadmin, password=admin123!@#")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
