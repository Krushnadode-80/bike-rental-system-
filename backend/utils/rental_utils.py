from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.booking_model import Booking
from models.bike_model import Bike

def auto_cleanup_rentals(db: Session):
    now = datetime.now()
    
    # 1. Update "Booked" to "Completed" if time has passed
    active_bookings = db.query(Booking).filter(Booking.status == "Booked").all()
    
    for b in active_bookings:
        try:
            ret_date = None
            if " " in b.return_date:
                # Handle YYYY-MM-DD HH:MM
                ret_date = datetime.strptime(b.return_date, "%Y-%m-%d %H:%M")
            else:
                # Handle YYYY-MM-DD (set to end of day)
                ret_date = datetime.strptime(b.return_date, "%Y-%m-%d").replace(hour=23, minute=59)
            
            if now > ret_date:
                b.status = "Completed"
                b.completed_at = now.strftime("%Y-%m-%d %H:%M:%S")
                b.updated_at = b.completed_at
                # Restore bike availability only if no other active bookings exist
                other_active = db.query(Booking).filter(
                    Booking.bike_name == b.bike_name,
                    Booking.status == "Booked",
                    Booking.id != b.id
                ).first()
                
                if not other_active:
                    bike = db.query(Bike).filter(Bike.bike_name == b.bike_name).first()
                    if bike:
                        bike.availability = "Available"
        except Exception as e:
            print(f"Cleanup update error for booking {b.id}: {e}")
    
    db.commit()

    # 2. DELETE Cancelled bookings after 24 hours
    try:
        cancelled_bookings = db.query(Booking).filter(Booking.status == "Cancelled").all()
        for b in cancelled_bookings:
            if b.cancelled_at:
                c_date = datetime.strptime(b.cancelled_at, "%Y-%m-%d %H:%M:%S")
                if now > (c_date + timedelta(hours=24)):
                    db.delete(b)
    except Exception as e:
        print(f"Cleanup delete error (Cancelled): {e}")

    # 3. DELETE Completed bookings after 2 hours
    try:
        completed_bookings = db.query(Booking).filter(Booking.status == "Completed").all()
        for b in completed_bookings:
            if b.completed_at:
                comp_date = datetime.strptime(b.completed_at, "%Y-%m-%d %H:%M:%S")
                if now > (comp_date + timedelta(hours=2)):
                    db.delete(b)
            else:
                # If completed_at is missing (old records), set it now so it deletes in 2 hours
                b.completed_at = now.strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        print(f"Cleanup delete error (Completed): {e}")

    db.commit()
