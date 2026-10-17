"""
Database Administrator (DBA) Utility: Bikes Seeding & Inventory Script
Author: Senior Database Administrator / DBA Developer

Features:
- Idempotent upsert pattern (inserts new bikes, safely refreshes existing bikes).
- Unique constraint safety against `bikes_plate_number_key`.
- Transaction-safe with atomic commit/rollback.
- CLI options for `--mode upsert`, `--mode insert`, `--mode wipe`, and `--status`.
"""

import os
import sys
import json
import argparse

# Ensure utf-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from sqlalchemy import text
from database.database import SessionLocal, engine, Base
from models.bike_model import Bike


def display_inventory():
    """Prints a structured DBA report of the current bikes table in PostgreSQL."""
    db = SessionLocal()
    try:
        total = db.query(Bike).count()
        print("\n" + "=" * 80)
        print(f"DATABASE INVENTORY REPORT: 'bikes' table ({total} total records)")
        print("=" * 80)
        
        rows = db.query(Bike).order_by(Bike.id.asc()).all()
        if not rows:
            print("No bike records currently in database.")
        else:
            header = f"{'ID':<4} | {'Plate Number':<13} | {'Brand':<15} | {'Model Name':<28} | {'Daily Rate':<10} | {'Status'}"
            print(header)
            print("-" * 80)
            for b in rows:
                print(f"{b.id:<4} | {b.plate_number or 'N/A':<13} | {b.brand:<15} | {b.bike_name:<28} | Rs.{b.price_per_day:<7} | {b.availability}")
        print("=" * 80 + "\n")
    except Exception as e:
        print(f"[DBA ERROR] Failed to fetch inventory: {e}", file=sys.stderr)
    finally:
        db.close()


def seed_bikes(json_file_path=None, mode="upsert"):
    """
    Seeds bikes from JSON file into PostgreSQL database.
    
    Modes:
        - 'upsert': Insert if new, update specifications/images if existing.
        - 'insert': Insert only, skip any existing plate/name.
        - 'wipe': Clear existing bikes and reseed with fresh IDs.
    """
    if json_file_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(base_dir, "bikes.json")

    if not os.path.exists(json_file_path):
        print(f"[DBA ERROR] Seed file not found at: {json_file_path}", file=sys.stderr)
        return False

    with open(json_file_path, "r", encoding="utf-8") as f:
        bikes_data = json.load(f)

    print(f"\n[DBA SEED] Loaded {len(bikes_data)} bike templates from {os.path.basename(json_file_path)}")
    print(f"[DBA SEED] Execution mode: '{mode.upper()}'")

    db = SessionLocal()
    inserted_count = 0
    updated_count = 0
    skipped_count = 0

    try:
        # Wipe mode: Truncate bikes table with identity restart
        if mode == "wipe":
            print("[DBA CAUTION] Truncating 'bikes' table and resetting primary key sequences...")
            db.execute(text("TRUNCATE TABLE bikes RESTART IDENTITY CASCADE"))
            db.commit()
            print("[DBA] Truncation complete.")

        for item in bikes_data:
            plate = item.get("plate_number")
            name = item.get("bike_name")

            existing_bike = None
            if plate:
                existing_bike = db.query(Bike).filter(Bike.plate_number == plate).first()
            if not existing_bike and name:
                existing_bike = db.query(Bike).filter(Bike.bike_name == name).first()

            if existing_bike:
                if mode == "upsert":
                    # Update all relevant attributes
                    existing_bike.bike_name = item.get("bike_name", existing_bike.bike_name)
                    existing_bike.brand = item.get("brand", existing_bike.brand)
                    existing_bike.model = item.get("model", existing_bike.model)
                    existing_bike.price_per_day = item.get("price_per_day", existing_bike.price_per_day)
                    existing_bike.price_per_hour = item.get("price_per_hour", existing_bike.price_per_hour)
                    existing_bike.availability = item.get("availability", existing_bike.availability)
                    existing_bike.image_url = item.get("image_url", existing_bike.image_url)
                    existing_bike.engine = item.get("engine", existing_bike.engine)
                    existing_bike.torque = item.get("torque", existing_bike.torque)
                    existing_bike.fuel_tank = item.get("fuel_tank", existing_bike.fuel_tank)
                    existing_bike.mileage = item.get("mileage", existing_bike.mileage)
                    if plate:
                        existing_bike.plate_number = plate
                    
                    updated_count += 1
                    print(f"  [UPDATED] (ID: {existing_bike.id}) {existing_bike.bike_name} [{plate or 'No Plate'}]")
                else:
                    skipped_count += 1
                    print(f"  [SKIPPED] {name} already exists (ID: {existing_bike.id}).")
            else:
                new_bike = Bike(
                    bike_name=item["bike_name"],
                    brand=item["brand"],
                    model=item.get("model", "2024"),
                    price_per_day=item["price_per_day"],
                    price_per_hour=item.get("price_per_hour", 100),
                    availability=item.get("availability", "Available"),
                    image_url=item.get("image_url"),
                    engine=item.get("engine"),
                    torque=item.get("torque"),
                    fuel_tank=item.get("fuel_tank"),
                    mileage=item.get("mileage"),
                    plate_number=plate
                )
                db.add(new_bike)
                inserted_count += 1
                print(f"  [INSERTED] {item['bike_name']} (Plate: {plate or 'N/A'}, Daily: Rs.{item['price_per_day']})")

        db.commit()
        print("\n" + "-" * 50)
        print(f"[DBA SUMMARY] Operations completed successfully:")
        print(f"  - Inserted : {inserted_count}")
        print(f"  - Updated  : {updated_count}")
        print(f"  - Skipped  : {skipped_count}")
        print(f"  - Total In DB: {db.query(Bike).count()}")
        print("-" * 50)
        return True

    except Exception as e:
        db.rollback()
        print(f"[DBA ERROR] Transaction failed. Rolled back. Details: {e}", file=sys.stderr)
        return False
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="DBA Bike Seeder & Inventory Tool")
    parser.add_argument(
        "--mode",
        choices=["upsert", "insert", "wipe"],
        default="upsert",
        help="Seeding mode: 'upsert' (update or insert), 'insert' (insert only), 'wipe' (truncate and reseed)."
    )
    parser.add_argument(
        "--file",
        dest="json_file",
        default=None,
        help="Path to custom bikes JSON seed file."
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Display current database bikes inventory without making changes."
    )

    args = parser.parse_args()

    if args.status:
        display_inventory()
        return

    success = seed_bikes(json_file_path=args.json_file, mode=args.mode)
    if success:
        display_inventory()


if __name__ == "__main__":
    main()
