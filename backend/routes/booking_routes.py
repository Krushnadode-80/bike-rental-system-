from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from models.booking_model import Booking
from models.user_model import User
from models.bike_model import Bike
from schemas.booking_schema import BookingCreate
from utils.rental_utils import auto_cleanup_rentals
from auth.auth_handler import verify_token
from fastapi_mail import FastMail, MessageSchema
from utils.email_config import conf

router = APIRouter()

@router.post("/book-bike")
async def book_bike(
    booking: BookingCreate,
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if booking.user_email.strip().lower() != token_email.strip().lower():
        raise HTTPException(status_code=403, detail="Booking email must match logged-in account")

    user = db.query(User).filter(User.email == token_email).first()
    from datetime import datetime
    if not user or not user.is_verified:
        print(f"DEBUG: Booking blocked. User {token_email} is NOT verified.")
        raise HTTPException(status_code=403, detail="Please verify your registered email before booking")

    # Date Validation
    try:
        today = datetime.now().date()
        book_date_str = booking.booking_date.split(' ')[0]
        book_date = datetime.strptime(book_date_str, "%Y-%m-%d").date()
        
        if book_date < today:
            raise HTTPException(status_code=400, detail="Cannot book for past dates")
            
        if booking.return_date:
            ret_date_str = booking.return_date.split(' ')[0]
            ret_date = datetime.strptime(ret_date_str, "%Y-%m-%d").date()
            if ret_date < book_date:
                raise HTTPException(status_code=400, detail="Return date cannot be before booking date")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # DEBUG LOGGING
    print(f"DEBUG: Booking request for bike: '{booking.bike_name}'")
    
    # Update bike availability - Case-insensitive and trimmed check
    bike = db.query(Bike).filter(
        Bike.bike_name == booking.bike_name, 
        func.lower(Bike.availability).ilike('%availa%')
    ).first()
    
    if not bike:
        all_bikes = db.query(Bike).all()
        print(f"DEBUG: Bike not found or not available. Available bikes in DB: {[(b.bike_name, b.availability) for b in all_bikes]}")
        raise HTTPException(status_code=400, detail=f"Bike '{booking.bike_name}' is already booked or not found")
    
    print(f"DEBUG: Found bike: {bike.bike_name} with availability: {bike.availability}")
    bike.availability = "Booked"
    
    new_booking = Booking(
        user_id=user.id,
        user_email=booking.user_email,
        bike_name=booking.bike_name,
        booking_date=booking.booking_date,
        return_date=booking.return_date,
        total_price=booking.total_price,
        image_url=booking.image_url,
        status=booking.status,
        rental_type=booking.rental_type,
        duration=booking.duration,
        payment_status=booking.payment_status,
        updated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_booking)
    db.commit()

    # Dynamic Premium HTML Receipt Email
    html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #ff5e14; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">🏍 Bike Rental System</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Booking Invoice & Confirmation</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #ff5e14, #ff8008); color: #ffffff; padding: 22px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
            <h2 style="margin: 5px 0 0 0; font-size: 34px; font-weight: 800;">₹{booking.total_price}</h2>
            <span style="display: inline-block; background: rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 20px; font-size: 11px; margin-top: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">{booking.payment_status or 'Paid'}</span>
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">Hello <strong>{user.name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Great news! Your ride has been confirmed and reserved. Below are your booking transaction details:</p>
        
        <div style="border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 15px 0; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                <tr>
                    <td style="color: #64748b; padding: 8px 0; font-weight: 500;">Vehicle:</td>
                    <td style="text-align: right; padding: 8px 0; font-weight: 700; color: #0f172a;">{booking.bike_name}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 8px 0; font-weight: 500;">Rental Plan:</td>
                    <td style="text-align: right; padding: 8px 0; font-weight: 600; text-transform: capitalize;">{booking.rental_type or 'Daily'}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 8px 0; font-weight: 500;">Plan Duration:</td>
                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">{booking.duration or 'N/A'}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 8px 0; font-weight: 500;">Pickup Date & Time:</td>
                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">{booking.booking_date}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 8px 0; font-weight: 500;">Expected Return:</td>
                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">{booking.return_date or 'N/A'}</td>
                </tr>
            </table>
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #ff5e14; padding: 12px 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px; font-size: 13px; color: #475569; line-height: 1.5;">
            <strong>Pro Tip:</strong> Please bring a copy of this digital receipt and your original driving license/Aadhaar card to the pickup desk when claiming your ride.
        </div>
        
        <div style="text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="margin: 0 0 5px 0;">This email serves as your official purchase confirmation invoice receipt.</p>
            <p style="margin: 0;">Need assistance? We are here 24/7. Reach out via support@bikerental.com</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject=f"🏍 Booking Confirmed: {booking.bike_name}",
        recipients=[token_email],
        body=html,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"INFO: Successfully sent booking invoice to {token_email}")
    except Exception as e:
        print(f"EMAIL ERROR: Failed to send booking confirmation receipt: {str(e)}")

    return {
        "message": "Bike Booked Successfully"
    }

@router.get("/my-bookings/{email}")
def get_bookings(
    email: str,
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if email.strip().lower() != token_email.strip().lower():
        raise HTTPException(status_code=403, detail="You can only view your own bookings")

    user = db.query(User).filter(func.lower(User.email) == token_email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    auto_cleanup_rentals(db)
    bookings = db.query(Booking).filter(
        Booking.user_id == user.id
    ).all()
    # Sort bookings newest activity first
    bookings.sort(key=lambda b: b.updated_at or b.booking_date or "", reverse=True)
    return bookings

@router.delete("/cancel-booking/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        return {
            "message": "Booking Not Found"
        }

    from datetime import datetime
    booking.status = "Cancelled"
    booking.cancelled_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    booking.updated_at = booking.cancelled_at
    
    # Mark bike as available again only if no other active bookings exist
    other_active = db.query(Booking).filter(
        Booking.bike_name == booking.bike_name,
        Booking.status == "Booked",
        Booking.id != booking.id
    ).first()
    
    if not other_active:
        bike = db.query(Bike).filter(Bike.bike_name == booking.bike_name).first()
        if bike:
            bike.availability = "Available"
        
    db.commit()
    return {
        "message": "Booking Cancelled Successfully"
    }

@router.get("/admin/bookings")
def get_all_bookings(db: Session = Depends(get_db)):
    auto_cleanup_rentals(db)
    bookings = db.query(Booking).all()
    bookings_with_names = []
    for b in bookings:
        user = db.query(User).filter(User.email == b.user_email).first()
        bookings_with_names.append({
            "id": b.id,
            "user_email": b.user_email,
            "user_name": user.name if user else "Unknown User",
            "bike_name": b.bike_name,
            "booking_date": b.booking_date,
            "return_date": b.return_date,
            "total_price": b.total_price,
            "status": b.status,
            "rental_type": b.rental_type,
            "duration": b.duration,
            "payment_status": b.payment_status,
            "updated_at": b.updated_at
        })
    # Sort bookings newest activity first
    bookings_with_names.sort(key=lambda x: x["updated_at"] or x["booking_date"] or "", reverse=True)
    return bookings_with_names
