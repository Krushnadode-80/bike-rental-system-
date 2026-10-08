from pydantic import BaseModel
from typing import Optional

class BikeCreate(BaseModel):
    bike_name: str
    brand: str
    model: str
    price_per_day: int
    availability: str
    image_url: str
    engine: Optional[str] = None
    torque: Optional[str] = None
    fuel_tank: Optional[str] = None
    mileage: Optional[str] = None
    plate_number: Optional[str] = None

