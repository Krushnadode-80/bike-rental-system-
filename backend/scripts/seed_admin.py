from database.database import SessionLocal
from models.user_model import User
from auth.auth_handler import hash_password

db = SessionLocal()

admin_email = "admin@gmail.com"
existing = db.query(User).filter(User.email == admin_email).first()

if not existing:
    admin_user = User(
        name="Admin User",
        email=admin_email,
        password=hash_password("admin123"),
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    print(f"Admin user created: {admin_email} / admin123")
else:
    print("Admin user already exists.")

db.close()
