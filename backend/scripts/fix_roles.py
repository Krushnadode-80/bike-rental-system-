from database.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("UPDATE users SET role = 'admin' WHERE email = 'krushna@gmail.com' OR email = 'Krushna@gmail.com'"))
    conn.execute(text("UPDATE users SET role = 'user' WHERE role IS NULL"))
    print("Database updated: Krushna is now Admin, others are Users.")
