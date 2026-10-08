from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    cols = ["rental_type", "duration", "payment_status"]
    for col in cols:
        try:
            conn.execute(text(f"ALTER TABLE bookings ADD COLUMN {col} TEXT"))
            conn.commit()
            print(f"Column {col} added to bookings successfully.")
        except Exception as e:
            print(f"Error adding {col} or already exists: {e}")
