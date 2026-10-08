from database.database import SessionLocal
from models.booking_model import Booking
from utils.rental_utils import auto_cleanup_rentals
from datetime import datetime, timedelta

def test_cleanup():
    db = SessionLocal()
    now = datetime.now()
    
    # 1. Create a dummy cancelled booking (simulated 25 hours ago)
    cancelled_old = Booking(
        user_email="test@example.com",
        bike_name="Test Bike 1",
        status="Cancelled",
        cancelled_at=(now - timedelta(hours=25)).strftime("%Y-%m-%d %H:%M:%S")
    )
    
    # 2. Create a dummy completed booking (simulated 3 hours ago)
    completed_old = Booking(
        user_email="test@example.com",
        bike_name="Test Bike 2",
        status="Completed",
        completed_at=(now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
    )

    # 3. Create a fresh cancelled booking (should NOT be deleted)
    cancelled_fresh = Booking(
        user_email="test@example.com",
        bike_name="Test Bike 3",
        status="Cancelled",
        cancelled_at=now.strftime("%Y-%m-%d %H:%M:%S")
    )

    db.add(cancelled_old)
    db.add(completed_old)
    db.add(cancelled_fresh)
    db.commit()
    
    print("Dummy bookings added. Running cleanup...")
    
    auto_cleanup_rentals(db)
    
    # Check if they still exist
    b1 = db.query(Booking).filter(Booking.bike_name == "Test Bike 1").first()
    b2 = db.query(Booking).filter(Booking.bike_name == "Test Bike 2").first()
    b3 = db.query(Booking).filter(Booking.bike_name == "Test Bike 3").first()
    
    print(f"Test Bike 1 (Cancelled > 24h): {'DELETED' if not b1 else 'STILL EXISTS'}")
    print(f"Test Bike 2 (Completed > 2h): {'DELETED' if not b2 else 'STILL EXISTS'}")
    print(f"Test Bike 3 (Cancelled < 24h): {'STILL EXISTS' if b3 else 'DELETED (ERROR)'}")
    
    # Cleanup dummy b3
    if b3:
        db.delete(b3)
        db.commit()
    db.close()

if __name__ == "__main__":
    test_cleanup()
