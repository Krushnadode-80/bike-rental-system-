from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    rows = conn.execute(
        text("SELECT column_name FROM information_schema.columns WHERE table_name='users'")
    )
    cols = [r[0] for r in rows]
    print("Columns:", cols)
    if "role" not in cols:
        print(">>> 'role' column MISSING — adding it now...")
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
        conn.commit()
        print(">>> Done! 'role' column added.")
    else:
        print(">>> 'role' column already exists, all good.")
