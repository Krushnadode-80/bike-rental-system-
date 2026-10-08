from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    row = conn.execute(text('SELECT * FROM users LIMIT 1')).mappings().first()
    if row:
        print("User Info:")
        for key, value in row.items():
            print(f"{key}: {value}")
    else:
        print("No users found.")
