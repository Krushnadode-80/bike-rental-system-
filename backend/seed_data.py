import json
import os
from database.database import SessionLocal
from models.user_model import User
from models.bike_model import Bike
from auth.auth_handler import hash_password

def seed_database():
    db = SessionLocal()
    
    # Seed Users
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        users_file = os.path.join(base_dir, "users.json")
        with open(users_file, "r") as f:
            users_data = json.load(f)
            
        for user_data in users_data:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                new_user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password=hash_password(user_data["password"]),
                    role=user_data["role"]
                )
                db.add(new_user)
                print(f"Added user: {user_data['email']}")
            else:
                print(f"User {user_data['email']} already exists.")
    except Exception as e:
        print(f"Error seeding users: {e}")

    # Seed Bikes
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bikes_file = os.path.join(base_dir, "bikes.json")
        with open(bikes_file, "r") as f:
            bikes_data = json.load(f)
            
        # Seed Bikes (Upsert pattern)
        for bike_data in bikes_data:
            plate = bike_data.get("plate_number")
            name = bike_data.get("bike_name")

            existing_bike = None
            if plate:
                existing_bike = db.query(Bike).filter(Bike.plate_number == plate).first()
            if not existing_bike and name:
                existing_bike = db.query(Bike).filter(Bike.bike_name == name).first()
                
            if existing_bike:
                # Upsert / refresh attributes
                for key, val in bike_data.items():
                    if hasattr(existing_bike, key) and val is not None:
                        setattr(existing_bike, key, val)
                print(f"Refreshed existing bike: {name} [{plate}]")
            else:
                new_bike = Bike(**bike_data)
                db.add(new_bike)
                print(f"Added bike: {name} [{plate}]")

    except Exception as e:
        print(f"Error seeding bikes: {e}")

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_database()
