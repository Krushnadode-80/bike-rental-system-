from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT id, bike_name, availability FROM bikes"))
    print("BIKES IN DATABASE:")
    for row in result:
        print(f"ID: {row[0]} | Name: '{row[1]}' | Availability: '{row[2]}'")
