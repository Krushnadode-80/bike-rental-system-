from database.database import SessionLocal
from models.user_model import User
from auth.auth_handler import hash_password

db = SessionLocal()

admin_email = "admin@gmail.com"
# Delete existing if it exists
existing = db.query(User).filter(User.email == admin_email).first()
if existing:
    db.delete(existing)
    db.commit()
    print("Old admin deleted.")

# Create fresh admin
admin_user = User(
    name="System Admin",
    email=admin_email,
    password=hash_password("admin123"),
    role="admin"
)
db.add(admin_user)
db.commit()
print(f"FRESH Admin user created: {admin_email} / admin123")

db.close()
