from sqlalchemy import Boolean, Column, Integer, String, text
from database.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="user")
    aadhaar_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)
    pan_card = Column(String, nullable=True)
    aadhaar_doc = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_verified = Column(Boolean, nullable=False, server_default=text("FALSE"))
    admin_verified = Column(Boolean, nullable=False, server_default=text("FALSE"))

class OTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True)
    email = Column(String)
    otp = Column(String)
    expires_at = Column(Integer)

class UserVerification(Base):
    __tablename__ = "user_verifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    email = Column(String)
    otp = Column(String)
    status = Column(String, default="pending") # pending, verified, expired
    created_at = Column(Integer)
    expires_at = Column(Integer)

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True)
    user_email = Column(String, nullable=False)
    bike_id = Column(Integer, nullable=False)
