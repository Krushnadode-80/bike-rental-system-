from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("BIKES TABLE COLUMNS:")
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'bikes'"))
    for row in result:
        print(row[0])

    print("\nBOOKINGS TABLE COLUMNS:")
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings'"))
    for row in result:
        print(row[0])
