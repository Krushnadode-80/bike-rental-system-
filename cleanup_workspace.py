import os
import shutil

backend_dir = r"c:\Users\HP\Downloads\bike-rental-system\backend"
scripts_dir = os.path.join(backend_dir, "scripts")

# Create scripts dir
if not os.path.exists(scripts_dir):
    os.makedirs(scripts_dir)

files_to_move = [
    "add_hourly_price.py", "alter_db.py", "check_columns.py", "check_data_pg.py",
    "check_schema_pg.py", "check_schema_sqlite.py", "create_otps_table.py",
    "create_verifications_table.py", "debug_bikes.py", "debug_users.py",
    "emergency_reset.py", "fix_bikes_table.py", "fix_roles.py", "force_reseed_admin.py",
    "get_user.py", "inspect_users.py", "invoice.py", "migrate_db.py", "normalize_bikes.py",
    "qr_generator.py", "rename_passport_to_pan_card.py", "seed_admin.py", "test_conn.py",
    "test_db.py", "test_flow.py", "test_hash.py", "test_razorpay.py", "test_register.py",
    "update_bookings_table.py", "update_bookings_v2.py", "update_db_v3.py",
    "update_users_db.py", "update_users_photos.py", "verify_cleanup.py"
]

for filename in files_to_move:
    src = os.path.join(backend_dir, filename)
    dst = os.path.join(scripts_dir, filename)
    if os.path.exists(src):
        shutil.move(src, dst)
        print(f"Moved {filename}")

# Delete backend/frontend if it exists
frontend_dir = os.path.join(backend_dir, "frontend")
if os.path.exists(frontend_dir):
    try:
        shutil.rmtree(frontend_dir)
        print("Deleted backend/frontend directory")
    except Exception as e:
        print(f"Failed to delete {frontend_dir}: {e}")

print("Cleanup complete.")
