from sqlalchemy import Column, Integer, String
from database.database import Base

class Bike(Base):
    __tablename__ = "bikes"

    id = Column(Integer, primary_key=True)
    bike_name = Column(String)
    brand = Column(String)
    model = Column(String)
    price_per_day = Column(Integer)
    price_per_hour = Column(Integer)
    availability = Column(String)
    image_url = Column(String)
    engine = Column(String, nullable=True)
    torque = Column(String, nullable=True)
    fuel_tank = Column(String, nullable=True)
    mileage = Column(String, nullable=True)
    plate_number = Column(String, nullable=True)

