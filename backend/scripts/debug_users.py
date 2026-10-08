from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    rows = conn.execute(text("SELECT email, role FROM users")).fetchall()
    print("Users in DB:")
    for row in rows:
        print(f"  Email: {row[0]}, Role: {row[1]}")
