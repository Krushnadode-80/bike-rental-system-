from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Adding cancelled_at and completed_at columns to bookings table...")
    try:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN cancelled_at VARCHAR"))
        print("Added column: cancelled_at")
    except Exception as e:
        print(f"Column cancelled_at might already exist or error: {e}")

    try:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN completed_at VARCHAR"))
        print("Added column: completed_at")
    except Exception as e:
        print(f"Column completed_at might already exist or error: {e}")

    conn.commit()
    print("Database migration complete!")
