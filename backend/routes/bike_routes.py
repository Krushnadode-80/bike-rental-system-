from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.bike_model import Bike
from models.user_model import Favorite
from schemas.bike_schema import BikeCreate
from auth.auth_handler import verify_token

router = APIRouter()

@router.post("/add-bike")
def add_bike(
    bike: BikeCreate,
    db: Session = Depends(get_db)
):
    new_bike = Bike(
        bike_name=bike.bike_name,
        brand=bike.brand,
        model=bike.model,
        price_per_day=bike.price_per_day,
        availability=bike.availability,
        image_url=bike.image_url,
        engine=bike.engine,
        torque=bike.torque,
        fuel_tank=bike.fuel_tank,
        mileage=bike.mileage,
        plate_number=bike.plate_number
    )
    db.add(new_bike)
    db.commit()
    return {
        "message": "Bike Added Successfully"
    }

from utils.rental_utils import auto_cleanup_rentals

@router.get("/bikes")
def get_bikes(
    db: Session = Depends(get_db)
):
    auto_cleanup_rentals(db)
    bikes = db.query(Bike).all()
    return bikes

@router.put("/update-bike/{bike_id}")
def update_bike(
    bike_id: int,
    updated_bike: BikeCreate,
    db: Session = Depends(get_db)
):
    bike = db.query(Bike).filter(
        Bike.id == bike_id
    ).first()

    if not bike:
        return {
            "message": "Bike Not Found"
        }

    bike.bike_name = updated_bike.bike_name
    bike.brand = updated_bike.brand
    bike.model = updated_bike.model
    bike.price_per_day = updated_bike.price_per_day
    bike.availability = updated_bike.availability
    bike.image_url = updated_bike.image_url
    bike.engine = updated_bike.engine
    bike.torque = updated_bike.torque
    bike.fuel_tank = updated_bike.fuel_tank
    bike.mileage = updated_bike.mileage
    bike.plate_number = updated_bike.plate_number

    db.commit()

    return {
        "message": "Bike Updated Successfully"
    }

@router.delete("/delete-bike/{bike_id}")
def delete_bike(
    bike_id: int,
    db: Session = Depends(get_db)
):
    bike = db.query(Bike).filter(
        Bike.id == bike_id
    ).first()

    if not bike:
        return {
            "message": "Bike Not Found"
        }

    db.delete(bike)
    db.commit()

    return {
        "message": "Bike Deleted Successfully"
    }

@router.post("/favorites/toggle/{bike_id}")
def toggle_favorite(
    bike_id: int,
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # Check if bike exists
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")

    fav = db.query(Favorite).filter(
        Favorite.user_email == token_email,
        Favorite.bike_id == bike_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
        return {"message": "Removed from favorites", "is_favorite": False}
    else:
        new_fav = Favorite(user_email=token_email, bike_id=bike_id)
        db.add(new_fav)
        db.commit()
        return {"message": "Added to favorites", "is_favorite": True}

@router.get("/favorites")
def get_favorites(
    token_email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite).filter(Favorite.user_email == token_email).all()
    bike_ids = [f.bike_id for f in favs]
    bikes = db.query(Bike).filter(Bike.id.in_(bike_ids)).all() if bike_ids else []
    return bikes
