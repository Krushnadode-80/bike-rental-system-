from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users RENAME COLUMN passport_photo TO pan_card;"))
        conn.commit()
        print("Table users updated successfully.")
    except Exception as e:
        print(f"Update error: {e}")
