from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Adding missing columns to bikes table...")
    try:
        conn.execute(text("ALTER TABLE bikes ADD COLUMN engine VARCHAR"))
        print("Added column: engine")
    except Exception as e:
        print(f"Column engine might already exist or error: {e}")

    try:
        conn.execute(text("ALTER TABLE bikes ADD COLUMN torque VARCHAR"))
        print("Added column: torque")
    except Exception as e:
        print(f"Column torque might already exist or error: {e}")

    try:
        conn.execute(text("ALTER TABLE bikes ADD COLUMN fuel_tank VARCHAR"))
        print("Added column: fuel_tank")
    except Exception as e:
        print(f"Column fuel_tank might already exist or error: {e}")

    try:
        conn.execute(text("ALTER TABLE bikes ADD COLUMN mileage VARCHAR"))
        print("Added column: mileage")
    except Exception as e:
        print(f"Column mileage might already exist or error: {e}")

    conn.commit()
    print("Done!")
