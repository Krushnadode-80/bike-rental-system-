from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    cols = ["aadhaar_number", "address"]
    for col in cols:
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} TEXT"))
            conn.commit()
            print(f"Column {col} added to users successfully.")
        except Exception as e:
            print(f"Error adding {col} or already exists: {e}")
