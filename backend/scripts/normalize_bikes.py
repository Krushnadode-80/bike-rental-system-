from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("UPDATE bikes SET availability = 'Available' WHERE availability IS NULL OR availability = '' OR availability = 'available'"))
        conn.commit()
        print("Existing bikes normalized to 'Available'.")
    except Exception as e:
        print(f"Error normalizing bikes: {e}")
