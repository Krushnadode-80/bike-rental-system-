from database.database import SessionLocal
from models.user_model import User

try:
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Database Connected! Users found: {len(users)}")
    db.close()
except Exception as e:
    print(f"Database Connection Failed: {e}")
