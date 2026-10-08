from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import random
import secrets
import os
import shutil
import time
from fastapi_mail import FastMail
from fastapi_mail import MessageSchema
from utils.email_config import conf
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy import text
from sqlalchemy.orm import Session

from database.database import get_db

from models.user_model import User, OTP

from schemas.user_schema import UserCreate, UserLogin, UserProfileUpdate, UserProfileResponse

from auth.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

router = APIRouter()

@router.post("/send-otp")
async def send_otp(
    email: str,
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if email.strip().lower() != token_email.strip().lower():
        raise HTTPException(status_code=403, detail="You can verify only your registered account email")

    user = db.query(User).filter(User.email == token_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified", "already_verified": True}

    otp = str(random.randint(100000, 999999))
    
    # Store in DB for persistent expiration logic
    db.query(OTP).filter(OTP.email == token_email).delete()
    new_otp = OTP(email=token_email, otp=otp, expires_at=int(time.time() + 150))
    db.add(new_otp)
    db.commit()

    html = f"""
    <div style='padding:20px; font-family:Arial;'>
        <h1>Bike Rental Verification</h1>
        <h2>Your OTP:</h2>
        <h1 style='color:orange;'>{otp}</h1>
        <p>Verify your email to continue booking.</p>
    </div>
    """

    message = MessageSchema(
        subject="Bike Rental OTP Verification",
        recipients=[token_email],
        body=html,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        return {"message": "OTP Sent To Mailbox"}
    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        db.query(OTP).filter(OTP.email == token_email).delete()
        db.commit()
        raise HTTPException(status_code=503, detail="Unable to send OTP right now. Please try again later.")

@router.post("/verify-otp")
def verify_otp(
    email: str,
    otp: str,
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if email.strip().lower() != token_email.strip().lower():
        raise HTTPException(status_code=403, detail="You can verify only your registered account email")

    user = db.query(User).filter(User.email == token_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Already verified", "already_verified": True}

    otp_record = db.query(OTP).filter(OTP.email == token_email).first()
    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    if time.time() > otp_record.expires_at:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired")
    if not secrets.compare_digest(str(otp_record.otp), str(otp)):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.is_verified = True
    db.delete(otp_record)
    db.commit()
    return {"message": "Verified"}

@router.post("/upload-photo")
def upload_photo(
    type: str = Form(...), # 'profile' or 'pan_card'
    file: UploadFile = File(...),
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    os.makedirs("uploads", exist_ok=True)
    
    file_extension = file.filename.split('.')[-1]
    filename = f"{type}_{user.id}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    url = f"http://127.0.0.1:8000/uploads/{filename}"
    if type == "profile":
        user.profile_photo = url
    elif type == "pan_card":
        user.pan_card = url
    elif type == "aadhaar":
        user.aadhaar_doc = url
        
    db.commit()
    return {"url": url}

@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    user.email = user.email.strip().lower()
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    try:
        print(f"DEBUG: Hashing password for {user.email}")
        print(f"DEBUG: Password type: {type(user.password)}")
        print(f"DEBUG: Password value: {user.password}")
        
        hashed_password = hash_password(
            user.password
        )

        db.execute(
            text(
                """
                INSERT INTO users (
                    name,
                    email,
                    password,
                    role,
                    aadhaar_number,
                    address,
                    profile_photo,
                    pan_card,
                    aadhaar_doc,
                    phone,
                    is_verified
                ) VALUES (
                    :name,
                    :email,
                    :password,
                    :role,
                    NULL,
                    NULL,
                    NULL,
                    NULL,
                    NULL,
                    NULL,
                    FALSE
                )
                """
            ),
            {
                "name": user.name,
                "email": user.email,
                "password": hashed_password,
                "role": user.role,
            }
        )
        db.commit()

        return {
            "message": "User Registered Successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Error during registration: {str(e)}")
        error_msg = str(e).lower()
        if "unique constraint" in error_msg or "already exists" in error_msg or "duplicate" in error_msg:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Registration failed due to a server error")

@router.post("/login")

def login_user(

    user: UserLogin,

    db: Session = Depends(get_db)
):

    user.email = user.email.strip().lower()
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        raise HTTPException(

            status_code=400,

            detail="Invalid Email"
        )

    password_check = verify_password(

        user.password,

        existing_user.password
    )

    if not password_check:

        raise HTTPException(

            status_code=400,

            detail="Invalid Password"
        )

    access_token = create_access_token(

        data={

            "sub": existing_user.email
        }
    )

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "role": existing_user.role,
        "name": existing_user.name
    }

@router.get("/me")

def get_me(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == email).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "aadhaar_number": user.aadhaar_number,
        "address": user.address,
        "profile_photo": user.profile_photo,
        "pan_card": user.pan_card,
        "aadhaar_doc": user.aadhaar_doc,
        "is_verified": bool(user.is_verified),
        "admin_verified": bool(user.admin_verified),
        "is_complete": bool(user.aadhaar_number and user.address and user.profile_photo and user.pan_card and user.aadhaar_doc and user.phone and user.is_verified)
    }

@router.post("/user/update-profile")
def update_profile(
    data: UserProfileUpdate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = data.name
    user.aadhaar_number = data.aadhaar_number
    user.address = data.address
    user.phone = data.phone
    
    db.commit()
    return {"message": "Profile updated successfully"}

