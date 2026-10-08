from database.database import engine
from sqlalchemy import text
import time

with engine.connect() as conn:
    try:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_verifications (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                email TEXT,
                otp TEXT,
                status TEXT DEFAULT 'pending',
                created_at INTEGER,
                expires_at INTEGER
            )
        """))
        conn.commit()
        print("Table 'user_verifications' created successfully.")
    except Exception as e:
        print(f"Error: {e}")
