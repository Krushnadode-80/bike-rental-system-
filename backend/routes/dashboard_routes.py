from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from models.user_model import User
from models.bike_model import Bike
from models.booking_model import Booking
from routes.admin_deps import get_admin_user

router = APIRouter()

@router.get("/admin/dashboard")
def admin_dashboard(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    from utils.rental_utils import auto_cleanup_rentals
    auto_cleanup_rentals(db)
    from datetime import datetime
    from collections import Counter, defaultdict

    total_users = db.query(User).count()
    total_bikes = db.query(Bike).count()
    total_bookings = db.query(Booking).count()
    total_revenue = db.query(
        func.sum(Booking.total_price)
    ).scalar() or 0

    bookings = db.query(Booking).all()
    
    # Revenue Analytics
    monthly_rev_dict = defaultdict(int)
    weekly_rev_dict = defaultdict(int)
    bike_counts = Counter()
    day_counts = Counter()
    
    # Pre-fill last 6 months to ensure they exist in chart
    # (Simplified: just using whatever is in the DB for now, but usually you'd want a range)
    
    for b in bookings:
        if b.status != 'Cancelled' and b.booking_date:
            try:
                raw_date = str(b.booking_date).strip()
                if not raw_date or raw_date == "None": continue
                
                # Try common formats
                dt = None
                date_part = raw_date.replace('T', ' ').split(' ')[0]
                
                for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d"):
                    try:
                        dt = datetime.strptime(date_part, fmt)
                        break
                    except:
                        continue
                
                if not dt:
                    print(f"CRITICAL: Could not parse date format for '{raw_date}'")
                    continue
                
                price = float(b.total_price or 0)
                
                month_key = dt.strftime("%b")
                monthly_rev_dict[month_key] += price
                
                day_key = dt.strftime("%a")
                weekly_rev_dict[day_key] += price
                
                day_counts[day_key] += 1
                
            except Exception as e:
                print(f"DASHBOARD ERROR: {e}")
                continue
        
        bike_counts[b.bike_name] += 1

    # Convert dicts to sorted lists for Recharts
    # Monthly: Full 12 month set for a complete chart
    months_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_revenue = [{"name": m, "revenue": monthly_rev_dict[m]} for m in months_order]
    
    # Weekly: Full 7 day set for a smooth line chart
    days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_revenue = [{"name": d, "revenue": weekly_rev_dict[d]} for d in days_order]

    most_booked_bike = bike_counts.most_common(1)[0][0] if bike_counts else "None"
    peak_booking_day = day_counts.most_common(1)[0][0] if day_counts else "None"
    
    active_rentals = db.query(Booking).filter(Booking.status == 'Booked').count()
    cancelled_rentals = db.query(Booking).filter(Booking.status == 'Cancelled').count()

    # Notifications
    notifications = []
    recent_bookings = db.query(Booking).order_by(Booking.id.desc()).limit(10).all()
    for rb in recent_bookings:
        user = db.query(User).filter(User.email == rb.user_email).first()
        notifications.append({
            "id": rb.id,
            "type": "Booking",
            "title": "New Booking" if rb.status == "Booked" else f"Booking {rb.status}",
            "message": f"{user.name if user else 'User'} reserved {rb.bike_name}",
            "time": rb.booking_date,
            "status": rb.status
        })

    return {
        "total_users": total_users,
        "total_bikes": total_bikes,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "weekly_revenue": weekly_revenue,
        "most_booked_bike": most_booked_bike,
        "peak_booking_day": peak_booking_day,
        "active_rentals": active_rentals,
        "cancelled_rentals": cancelled_rentals,
        "notifications": notifications
    }

@router.get("/admin/users")
def get_admin_users(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    user_list = []
    for user in users:
        booking_count = db.query(Booking).filter(Booking.user_email == user.email).count()
        user_list.append({
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
            "is_verified": user.is_verified,
            "admin_verified": user.admin_verified,
            "bookings": booking_count,
            "registration_date": "2024-05-13"
        })
    return user_list

@router.delete("/admin/users/{user_id}")
def delete_admin_user(
    user_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if (user.role or "user") == "admin":
        raise HTTPException(status_code=400, detail="Admin users cannot be deleted")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/admin/users/{user_id}")
def update_admin_user(
    user_id: int,
    user_data: dict,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "name" in user_data:
        user.name = user_data["name"]
    if "email" in user_data:
        user.email = user_data["email"]
    if "role" in user_data:
        user.role = user_data["role"]
    if "phone" in user_data:
        user.phone = user_data["phone"]
        
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully"}

@router.post("/admin/users/{user_id}/verify")
@router.put("/admin/users/{user_id}/verify")
@router.post("/users/{user_id}/verify")
@router.put("/users/{user_id}/verify")
def verify_admin_user(
    user_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.admin_verified = True
        db.commit()
        db.refresh(user)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to update verification status: {exc}"
        ) from exc

    return {
        "success": True,
        "message": "User verified successfully",
        "is_verified": bool(user.is_verified),
        "admin_verified": bool(user.admin_verified),
    }


@router.post("/admin/users/{user_id}/unverify")
@router.put("/admin/users/{user_id}/unverify")
@router.post("/users/{user_id}/unverify")
@router.put("/users/{user_id}/unverify")
def unverify_admin_user(
    user_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.admin_verified = False
        db.commit()
        db.refresh(user)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to update verification status: {exc}"
        ) from exc

    return {
        "success": True,
        "message": "User unverified successfully",
        "is_verified": bool(user.is_verified),
        "admin_verified": bool(user.admin_verified),
    }
