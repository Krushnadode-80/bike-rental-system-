from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("BIKES TABLE SCHEMA:")
    result = conn.execute(text("PRAGMA table_info(bikes)"))
    for row in result:
        print(row)

    print("\nBOOKINGS TABLE SCHEMA:")
    result = conn.execute(text("PRAGMA table_info(bookings)"))
    for row in result:
        print(row)
