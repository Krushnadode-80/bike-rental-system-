
import io
import cloudinary.uploader
from fastapi import APIRouter, File, HTTPException, UploadFile
from cloudinary.exceptions import Error as CloudinaryError

import cloudinary_config  # Loads configuration

router = APIRouter(tags=["Image Upload"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed",
        )

    try:
        # Read at most 5 MB + 1 byte to enforce size limit
        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400, detail="Empty file"
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image size must be 5 MB or less",
            )

        # Verify file signature, not just its extension or MIME type
        valid_signatures = {
            "image/jpeg": lambda b: b.startswith(b"\xff\xd8\xff"),
            "image/jpg": lambda b: b.startswith(b"\xff\xd8\xff"),
            "image/png": lambda b: b.startswith(
                b"\x89PNG\r\n\x1a\n"
            ),
            "image/webp": lambda b: (
                len(b) >= 12
                and b[:4] == b"RIFF"
                and b[8:12] == b"WEBP"
            ),
        }

        if not valid_signatures[file.content_type](content):
            raise HTTPException(
                status_code=400,
                detail="File content does not match its image type",
            )

        result = cloudinary.uploader.upload(
            io.BytesIO(content),
            folder="bike-rental",
            resource_type="image",
            allowed_formats=["jpg", "jpeg", "png", "webp"],
        )

        return {
            "message": "Image uploaded successfully",
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }

    except HTTPException:
        raise
    except CloudinaryError:
        raise HTTPException(
            status_code=502,
            detail="Cloudinary upload failed",
        )
    finally:
        await file.close()
