from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE bikes ADD COLUMN price_per_hour INTEGER DEFAULT 150"))
        conn.commit()
        print("Column price_per_hour added successfully.")
    except Exception as e:
        print(f"Error or already exists: {e}")
