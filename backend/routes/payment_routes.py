# Ensure pkg_resources is available for razorpay in Python 3.12+ serverless environments
try:
    import pkg_resources
except ImportError:
    try:
        import setuptools
        import pkg_resources
    except ImportError:
        import sys
        import types
        pkg_resources_stub = types.ModuleType("pkg_resources")
        class DistributionNotFound(Exception):
            pass
        pkg_resources_stub.DistributionNotFound = DistributionNotFound
        pkg_resources_stub.require = lambda *args, **kwargs: [types.SimpleNamespace(version="1.4.1")]
        pkg_resources_stub.get_distribution = lambda *args, **kwargs: types.SimpleNamespace(version="1.4.1")
        sys.modules["pkg_resources"] = pkg_resources_stub

import razorpay
import os
import qrcode
import base64

from io import BytesIO

from dotenv import dotenv_values, load_dotenv

from fastapi import APIRouter, HTTPException

from pydantic import BaseModel

# Load backend settings without overwriting values loaded from the project root.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_dir = os.path.dirname(backend_dir)
backend_env = dotenv_values(os.path.join(backend_dir, ".env"))
project_env = dotenv_values(os.path.join(project_dir, ".env"))
load_dotenv(dotenv_path=os.path.join(project_dir, ".env"), override=False)
load_dotenv(dotenv_path=os.path.join(backend_dir, ".env"), override=False)

router = APIRouter()

# Prefer a complete pair from one source, so an ID from one .env is never
# accidentally combined with a secret from another.
runtime_key_id = os.getenv("RAZORPAY_KEY_ID")
runtime_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
if runtime_key_id and runtime_key_secret:
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET = runtime_key_id, runtime_key_secret
elif backend_env.get("RAZORPAY_KEY_ID") and backend_env.get("RAZORPAY_KEY_SECRET"):
    RAZORPAY_KEY_ID = backend_env["RAZORPAY_KEY_ID"]
    RAZORPAY_KEY_SECRET = backend_env["RAZORPAY_KEY_SECRET"]
elif project_env.get("RAZORPAY_KEY_ID") and project_env.get("RAZORPAY_KEY_SECRET"):
    RAZORPAY_KEY_ID = project_env["RAZORPAY_KEY_ID"]
    RAZORPAY_KEY_SECRET = project_env["RAZORPAY_KEY_SECRET"]
else:
    RAZORPAY_KEY_ID = runtime_key_id or backend_env.get("RAZORPAY_KEY_ID") or project_env.get("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = runtime_key_secret or backend_env.get("RAZORPAY_KEY_SECRET") or project_env.get("RAZORPAY_KEY_SECRET")

UPI_ID = os.getenv("UPI_ID") or backend_env.get("UPI_ID") or project_env.get("UPI_ID")

# Keep the API available if payment credentials have not been configured yet.
client = (
    razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    else None
)


def _require_razorpay_client():
    if client is None:
        raise HTTPException(status_code=503, detail="Razorpay payments are not configured on the server.")
    return client

# ----------------------------
# REQUEST MODELS
# ----------------------------

class OrderRequest(BaseModel):

    amount: int


class VerifyRequest(BaseModel):

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str


# ----------------------------
# CREATE ORDER
# ----------------------------

@router.post("/create-order")

async def create_order(

    request: OrderRequest
):

    try:

        razorpay_client = _require_razorpay_client()

        if request.amount <= 0:

            raise HTTPException(

                status_code=400,

                detail="Amount must be greater than 0"
            )

        amount_paise = request.amount * 100

        order = razorpay_client.order.create({

            "amount": amount_paise,

            "currency": "INR",

            "payment_capture": 1
        })

        return {

            "success": True,

            "order": order
        }

    except HTTPException:
        raise

    except Exception as e:

        print(f"RAZORPAY ERROR: {str(e)}")

        raise HTTPException(

            status_code=400,

            detail=f"Failed to create order: {str(e)}"
        )


# ----------------------------
# VERIFY PAYMENT
# ----------------------------

@router.post("/verify-payment")

async def verify_payment(

    request: VerifyRequest
):

    try:

        razorpay_client = _require_razorpay_client()

        razorpay_client.utility.verify_payment_signature({

            "razorpay_order_id":
            request.razorpay_order_id,

            "razorpay_payment_id":
            request.razorpay_payment_id,

            "razorpay_signature":
            request.razorpay_signature
        })

        return {

            "success": True,

            "message":
            "Payment Verified Successfully"
        }

    except HTTPException:
        raise

    except Exception as e:

        print(f"VERIFICATION ERROR: {str(e)}")

        raise HTTPException(

            status_code=400,

            detail="Payment Verification Failed"
        )


# ----------------------------
# GENERATE QR CODE
# ----------------------------

@router.get("/generate-qr")

async def generate_qr(

    amount: int
):

    try:

        if not UPI_ID:
            raise HTTPException(status_code=503, detail="UPI payments are not configured on the server.")

        if amount <= 0:

            raise HTTPException(

                status_code=400,

                detail="Invalid amount"
            )

        upi_link = (

            f"upi://pay?"

            f"pa={UPI_ID}"

            f"&pn=BikeRental"

            f"&am={amount}"

            f"&cu=INR"
        )

        img = qrcode.make(upi_link)

        buffered = BytesIO()

        img.save(

            buffered,

            format="PNG"
        )

        img_str = base64.b64encode(

            buffered.getvalue()

        ).decode()

        return {

            "success": True,

            "upi_link": upi_link,

            "qr_image":
            f"data:image/png;base64,{img_str}"
        }

    except HTTPException:
        raise

    except Exception as e:

        print(f"QR ERROR: {str(e)}")

        raise HTTPException(

            status_code=500,

            detail=str(e)
        )
