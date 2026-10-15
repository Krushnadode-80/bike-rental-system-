import os
import sys
import json

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_pw(pw: str):
    return pwd_context.hash(pw)

def find_working_connection():
    configured_url = os.getenv("DATABASE_URL", "postgresql://postgres:krushna@localhost:5432/bike_rental_db")
    
    # Try configured first, then variations
    candidates = [
        configured_url,
        "postgresql://postgres:krushna@127.0.0.1:5432/postgres",
        "postgresql://postgres:krushna@localhost:5432/postgres",
        "postgresql://postgres:krushna@127.0.0.1:5433/postgres",
        "postgresql://postgres:krushna@localhost:5433/postgres",
        "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
        "postgresql://postgres:postgres@localhost:5432/postgres",
        "postgresql://postgres:admin@127.0.0.1:5432/postgres",
        "postgresql://postgres:root@127.0.0.1:5432/postgres",
        "postgresql://postgres:1234@127.0.0.1:5432/postgres",
        "postgresql://postgres:123456@127.0.0.1:5432/postgres"
    ]
    
    for url in candidates:
        try:
            print(f"Testing PostgreSQL connection: {url.split('@')[-1]}...")
            test_engine = create_engine(url, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"SUCCESS: Connected to PostgreSQL using: {url}")
            return url
        except Exception as e:
            # print error briefly
            err_msg = str(e).splitlines()[0] if str(e) else ""
            continue
            
    return None

def generate_sql_file():
    sql_path = os.path.join(base_dir, "database", "bike_rental_db_setup.sql")
    users_file = os.path.join(base_dir, "users.json")
    bikes_file = os.path.join(base_dir, "bikes.json")

    with open(users_file, "r") as f:
        users = json.load(f)

    with open(bikes_file, "r") as f:
        bikes = json.load(f)

    admin_hash = hash_pw("admin123")
    user_hash = hash_pw("clientpassword123")

    sql_content = f"""-- ====================================================================
-- PostgreSQL Database & Tables Setup for Bike Rental System
-- ====================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    aadhaar_number VARCHAR(100),
    address TEXT,
    profile_photo TEXT,
    pan_card TEXT,
    aadhaar_doc TEXT,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    admin_verified BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS bikes (
    id SERIAL PRIMARY KEY,
    bike_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    price_per_day INTEGER NOT NULL,
    price_per_hour INTEGER DEFAULT 100,
    availability VARCHAR(50) DEFAULT 'Available',
    image_url TEXT,
    engine VARCHAR(100),
    torque VARCHAR(100),
    fuel_tank VARCHAR(100),
    mileage VARCHAR(100),
    plate_number VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    bike_name VARCHAR(255),
    booking_date VARCHAR(100),
    return_date VARCHAR(100),
    total_price INTEGER,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Confirmed',
    rental_type VARCHAR(50) DEFAULT 'daily',
    duration VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    cancelled_at VARCHAR(100),
    completed_at VARCHAR(100),
    updated_at VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_bookings_user_id ON bookings(user_id);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    bike_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    email VARCHAR(255),
    otp VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    created_at BIGINT,
    expires_at BIGINT
);

-- 2. Seed Initial Users
INSERT INTO users (name, email, password, role, is_verified, admin_verified)
VALUES 
('Admin User', 'admin@gmail.com', '{admin_hash}', 'admin', TRUE, TRUE),
('Client User', 'client@example.com', '{user_hash}', 'user', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Initial Bikes
INSERT INTO bikes (bike_name, brand, model, price_per_day, price_per_hour, availability, image_url, engine, torque, fuel_tank, mileage, plate_number)
VALUES
('Royal Enfield Classic 350', 'Royal Enfield', '2023', 1200, 150, 'Available', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', '349cc', '27 Nm', '13 L', '35 kmpl', 'MH12AB1234'),
('Honda Activa 6G', 'Honda', '2023', 500, 50, 'Available', 'https://images.unsplash.com/photo-1629895237742-1262d29fdfac?q=80&w=800', '109cc', '8.9 Nm', '5.3 L', '50 kmpl', 'MH12XY5678'),
('KTM Duke 390', 'KTM', '2023', 1500, 250, 'Available', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800', '373cc', '37 Nm', '13.4 L', '25 kmpl', 'MH12YZ9012')
ON CONFLICT (plate_number) DO NOTHING;
"""
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"Generated SQL setup file at: {sql_path}")
    return sql_path

def main():
    sql_file = generate_sql_file()
    working_url = find_working_connection()
    if not working_url:
        print("\nCould not automatically authenticate to local PostgreSQL with default credentials.")
        print("Please check your PostgreSQL password or execute the generated SQL script directly.")
        return

    # Derive bike_rental_db url
    base_conn = working_url.rsplit("/", 1)[0]
    target_url = f"{base_conn}/bike_rental_db"

    # Create DB if needed
    try:
        srv_eng = create_engine(f"{base_conn}/postgres", isolation_level="AUTOCOMMIT")
        with srv_eng.connect() as conn:
            check = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'bike_rental_db'")).scalar()
            if not check:
                conn.execute(text("CREATE DATABASE bike_rental_db"))
                print("Created database 'bike_rental_db'")
        srv_eng.dispose()
    except Exception as e:
        print(f"Note on creating database: {e}")

    # Connect to bike_rental_db and execute schema
    print(f"Populating PostgreSQL database: {target_url}...")
    db_eng = create_engine(target_url)
    with open(sql_file, "r", encoding="utf-8") as f:
        statements = f.read()

    with db_eng.begin() as conn:
        for stmt in statements.split(";"):
            cleaned = stmt.strip()
            if cleaned and not cleaned.startswith("--"):
                conn.execute(text(cleaned))

    print("SUCCESS: All tables created and initial info stored in PostgreSQL 'bike_rental_db'!")

    # Verify tables
    inspector = inspect(db_eng)
    print("Tables verified:", inspector.get_table_names())

if __name__ == "__main__":
    main()
