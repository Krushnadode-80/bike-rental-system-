from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM bikes"))
    count = result.scalar()
    print(f"Total bikes in PG: {count}")

    if count > 0:
        result = conn.execute(text("SELECT bike_name, availability FROM bikes LIMIT 5"))
        for row in result:
            print(row)
