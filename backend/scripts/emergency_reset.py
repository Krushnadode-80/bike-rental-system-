from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("UPDATE bikes SET availability = 'Available'"))
    conn.commit()
    print("EMERGENCY RESET: All bikes are now 'Available'")
