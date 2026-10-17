# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
import sqlalchemy as sa
import os
from dotenv import load_dotenv
from database.database import engine, Base
from routes.upload_routes import router as upload_router

load_dotenv()

from models.user_model import User
from models.bike_model import Bike
from models.booking_model import Booking
from seed_data import seed_database

# Ensure pkg_resources is available for dependencies like razorpay in Python 3.12+
try:
    import pkg_resources
except ImportError:
    try:
        import setuptools
        import pkg_resources
    except ImportError:
        import sys, types
        pkg_resources_stub = types.ModuleType("pkg_resources")
        class DistributionNotFound(Exception):
            pass
        pkg_resources_stub.DistributionNotFound = DistributionNotFound
        pkg_resources_stub.require = lambda *args, **kwargs: [types.SimpleNamespace(version="1.4.1")]
        pkg_resources_stub.get_distribution = lambda *args, **kwargs: types.SimpleNamespace(version="1.4.1")
        sys.modules["pkg_resources"] = pkg_resources_stub

from routes.auth_routes import router as auth_router
from routes.bike_routes import router as bike_router
from routes.booking_routes import router as booking_router
from routes.dashboard_routes import router as dashboard_router
from routes.payment_routes import router as payment_router
from routes.chat_routes import router as chat_router

app = FastAPI()


def ensure_users_table_columns():
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

        if "is_verified" in existing_columns:
            for column in columns:
                if column["name"] == "is_verified" and not isinstance(column["type"], sa.Boolean):
                    conn.execute(text(
                        """
                        ALTER TABLE users
                        ALTER COLUMN is_verified TYPE BOOLEAN
                        USING CASE
                            WHEN is_verified IS NULL THEN FALSE
                            WHEN is_verified::TEXT IN ('1', 'true', 't', 'yes') THEN TRUE
                            ELSE FALSE
                        END
                        """
                    ))
                    break

        if "admin_verified" in existing_columns:
            for column in columns:
                if column["name"] == "admin_verified" and not isinstance(column["type"], sa.Boolean):
                    conn.execute(text(
                        """
                        ALTER TABLE users
                        ALTER COLUMN admin_verified TYPE BOOLEAN
                        USING CASE
                            WHEN admin_verified IS NULL THEN FALSE
                            WHEN admin_verified::TEXT IN ('1', 'true', 't', 'yes') THEN TRUE
                            ELSE FALSE
                        END
                        """
                    ))
                    break

        conn.execute(text("UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL"))
        conn.execute(text("UPDATE users SET admin_verified = FALSE WHERE admin_verified IS NULL"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN admin_verified SET DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN admin_verified SET NOT NULL"))

def ensure_bookings_table_columns():
    inspector = inspect(engine)
    if "bookings" not in inspector.get_table_names():
        return
    columns = inspector.get_columns("bookings")
    existing_columns = {column["name"] for column in columns}
    with engine.begin() as conn:
        if "user_id" not in existing_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN user_id INTEGER REFERENCES users(id)"))
        if "user_email" in existing_columns:
            conn.execute(text(
                """
                UPDATE bookings
                SET user_id = users.id
                FROM users
                WHERE bookings.user_id IS NULL
                  AND LOWER(bookings.user_email) = LOWER(users.email)
                """
            ))
        if "updated_at" not in existing_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN updated_at VARCHAR"))
            # For existing bookings, set updated_at to current time or their id proxy so they don't break sorting
            import datetime
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            conn.execute(text(f"UPDATE bookings SET updated_at = '{now_str}' WHERE updated_at IS NULL"))

        index_names = {index["name"] for index in inspect(conn).get_indexes("bookings")}
        if "ix_bookings_user_id" not in index_names:
            conn.execute(text("CREATE INDEX ix_bookings_user_id ON bookings (user_id)"))

# Add CORS Middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bike-rental-system-platform.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        ensure_users_table_columns()
        ensure_bookings_table_columns()
        seed_database()
    except Exception as e:
        print(f"DATABASE INITIALIZATION ERROR: {e}")

# Create uploads dir if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="api_uploads")

# Support both root paths and /api prefix paths for seamless local and Vercel services routing
app.include_router(upload_router, prefix="/api")
app.include_router(upload_router)
app.include_router(auth_router, prefix="/api")
app.include_router(auth_router)
app.include_router(bike_router, prefix="/api")
app.include_router(bike_router)
app.include_router(booking_router, prefix="/api")
app.include_router(booking_router)
app.include_router(dashboard_router, prefix="/api")
app.include_router(dashboard_router)
app.include_router(payment_router, prefix="/api")
app.include_router(payment_router)
app.include_router(chat_router)

@app.get("/")
@app.get("/api")
def home():
    return {
        "message": "Bike Rental API Running"
    }
