from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import random
import secrets
import os
import shutil
import time
import cloudinary.uploader
import cloudinary_config
from fastapi_mail import FastMail
from fastapi_mail import MessageSchema
from utils.email_config import conf
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy import text
from sqlalchemy.orm import Session

from database.database import get_db

from models.user_model import User, OTP

from schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserProfileUpdate,
    UserProfileResponse,
    ForgotPasswordRequest,
    ForgotPasswordReset
)

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
    type: str = Form(...), # 'profile', 'pan_card', or 'aadhaar'
    file: UploadFile = File(...),
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="bike-rental/kyc",
            resource_type="auto"
        )
        url = result.get("secure_url") or result.get("url")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Cloudinary upload failed: {str(e)}"
        )
    finally:
        file.file.close()
    
    if type == "profile":
        user.profile_photo = url
    elif type in ("pan_card", "pan"):
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


@router.post("/forgot-password/send-otp")
async def forgot_password_send_otp(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")
    
    otp = str(random.randint(100000, 999999))
    
    db.query(OTP).filter(OTP.email == email).delete()
    new_otp = OTP(email=email, otp=otp, expires_at=int(time.time() + 600))
    db.add(new_otp)
    db.commit()

    html = f"""
    <div style='padding:20px; font-family:Arial, sans-serif; color:#333; background-color:#fafafa; border-radius:8px;'>
        <h2 style='color:#ff5e14; margin-top:0;'>Bike Rental - Password Reset</h2>
        <p>Hello <b>{user.name}</b>,</p>
        <p>You requested to reset your password. Use the verification OTP code below:</p>
        <div style='background:#1e293b; padding:15px; border-radius:8px; display:inline-block; margin:15px 0;'>
            <h1 style='color:#ff5e14; margin:0; letter-spacing:6px; font-size:32px;'>{otp}</h1>
        </div>
        <p style='color:#64748b; font-size:14px;'>This OTP code is valid for <b>10 minutes</b>. If you did not request a password reset, please ignore this email.</p>
    </div>
    """

    message = MessageSchema(
        subject="Password Reset Verification Code - Bike Rental",
        recipients=[email],
        body=html,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        return {"message": "Password reset OTP sent to your email."}
    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        db.query(OTP).filter(OTP.email == email).delete()
        db.commit()
        raise HTTPException(status_code=503, detail="Unable to send email right now. Please try again later.")


@router.post("/forgot-password/reset")
def forgot_password_reset(
    payload: ForgotPasswordReset,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    otp_record = db.query(OTP).filter(OTP.email == email).first()
    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP not found or expired. Please request a new OTP.")
    if time.time() > otp_record.expires_at:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")
    if not secrets.compare_digest(str(otp_record.otp), str(payload.otp).strip()):
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    hashed_pwd = hash_password(payload.new_password)
    user.password = hashed_pwd
    db.delete(otp_record)
    db.commit()

    return {"message": "Password reset successful! You can now log in with your new password."}


