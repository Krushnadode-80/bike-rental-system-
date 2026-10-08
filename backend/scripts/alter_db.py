import sqlalchemy
from database.database import engine

def alter_db():
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("ALTER TABLE bikes ADD COLUMN plate_number VARCHAR;"))
            conn.commit()
            print("Successfully added plate_number to bikes table.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    alter_db()
