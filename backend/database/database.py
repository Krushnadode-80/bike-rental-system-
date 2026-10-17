from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Read DATABASE_URL from environment and sanitize quotes / whitespace
raw_url = os.getenv("DATABASE_URL", "").strip().strip('"').strip("'")
if not raw_url:
    raw_url = "postgresql://postgres:krushna@localhost:5432/bike_rental_db"

if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = raw_url

connect_args = {}
# Ensure SSL mode for remote cloud providers like Neon / Supabase
if "sslmode" not in DATABASE_URL and ("neon.tech" in DATABASE_URL or "supabase" in DATABASE_URL):
    connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Tests connection liveness before queries to avoid serverless connection drops
    pool_recycle=300,        # Recycles idle connections every 5 minutes
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()