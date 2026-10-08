from sqlalchemy import inspect, text
import sqlalchemy as sa

from database.database import Base, engine

# Import models so SQLAlchemy knows all tables before create_all runs.
from models.bike_model import Bike  # noqa: F401
from models.booking_model import Booking  # noqa: F401
from models.user_model import OTP, User, UserVerification, Favorite  # noqa: F401


def repair_users_table() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = inspector.get_columns("users")
    existing_columns = {column["name"] for column in columns}
    required_columns = {
        "aadhaar_number": "ALTER TABLE users ADD COLUMN aadhaar_number VARCHAR",
        "address": "ALTER TABLE users ADD COLUMN address VARCHAR",
        "profile_photo": "ALTER TABLE users ADD COLUMN profile_photo VARCHAR",
        "pan_card": "ALTER TABLE users ADD COLUMN pan_card VARCHAR",
        "aadhaar_doc": "ALTER TABLE users ADD COLUMN aadhaar_doc VARCHAR",
        "phone": "ALTER TABLE users ADD COLUMN phone VARCHAR",
        "is_verified": "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
        "admin_verified": "ALTER TABLE users ADD COLUMN admin_verified BOOLEAN DEFAULT FALSE",
    }

    with engine.begin() as conn:
        for column_name, ddl in required_columns.items():
            if column_name not in existing_columns:
                conn.execute(text(ddl))

        for column_name in ("is_verified", "admin_verified"):
            column = next((col for col in columns if col["name"] == column_name), None)
            if column and not isinstance(column["type"], sa.Boolean):
                conn.execute(text(
                    f"""
                    ALTER TABLE users
                    ALTER COLUMN {column_name} TYPE BOOLEAN
                    USING CASE
                        WHEN {column_name} IS NULL THEN FALSE
                        WHEN {column_name}::TEXT IN ('1', 'true', 't', 'yes') THEN TRUE
                        ELSE FALSE
                    END
                    """
                ))

        for column_name in ("is_verified", "admin_verified"):
            conn.execute(text(f"UPDATE users SET {column_name} = FALSE WHERE {column_name} IS NULL"))
            conn.execute(text(f"ALTER TABLE users ALTER COLUMN {column_name} SET DEFAULT FALSE"))
            conn.execute(text(f"ALTER TABLE users ALTER COLUMN {column_name} SET NOT NULL"))

def main() -> None:
    print("Creating missing tables...")
    Base.metadata.create_all(bind=engine)

    print("Repairing users table schema...")
    repair_users_table()

    inspector = inspect(engine)
    print("Done. Current tables:")
    for table in inspector.get_table_names():
        cols = [f"{column['name']} ({column['type']})" for column in inspector.get_columns(table)]
        print(f"  {table}: {cols}")


if __name__ == "__main__":
    main()
