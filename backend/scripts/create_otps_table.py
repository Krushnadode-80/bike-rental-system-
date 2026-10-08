from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY,
                email TEXT,
                otp TEXT,
                expires_at INTEGER
            )
        """))
        conn.commit()
        print("Table 'otps' created successfully.")
    except Exception as e:
        print(f"Error: {e}")
