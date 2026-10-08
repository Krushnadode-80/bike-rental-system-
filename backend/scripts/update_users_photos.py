from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_photo TEXT"))
        conn.execute(text("ALTER TABLE users ADD COLUMN passport_photo TEXT"))
        conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
        conn.commit()
        print("Table users updated successfully.")
    except Exception as e:
        print(f"Update error (maybe columns already exist): {e}")
