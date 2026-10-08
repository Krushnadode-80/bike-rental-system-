from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN image_url TEXT"))
        conn.commit()
        print("Column image_url added to bookings successfully.")
    except Exception as e:
        print(f"Error or already exists: {e}")
