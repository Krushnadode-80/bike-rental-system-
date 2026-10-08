from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    user_email: str
    bike_name: str
    booking_date: str
    return_date: str
    total_price: int
    image_url: Optional[str] = None
    status: str
    rental_type: Optional[str] = "daily"
    duration: Optional[str] = None
    payment_status: Optional[str] = "Pending"
