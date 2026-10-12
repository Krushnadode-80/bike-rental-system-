import os
import cloudinary
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# Check whether credentials are configured
if not all([
    os.getenv("CLOUDINARY_CLOUD_NAME"),
    os.getenv("CLOUDINARY_API_KEY"),
    os.getenv("CLOUDINARY_API_SECRET"),
]):
    raise RuntimeError(
        "Cloudinary credentials missing. Check backend/.env"
    )

print("Cloudinary configuration loaded successfully!")
