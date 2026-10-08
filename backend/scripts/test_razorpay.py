"""Test Razorpay API connection"""
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

key_id = os.getenv("RAZORPAY_KEY_ID")
key_secret = os.getenv("RAZORPAY_KEY_SECRET")

print(f"Key ID: {key_id}")
print(f"Key Secret: {key_secret[:4]}...{key_secret[-4:]}" if key_secret else "MISSING")

try:
    client = razorpay.Client(auth=(key_id, key_secret))
    order = client.order.create({
        "amount": 10000,
        "currency": "INR",
        "receipt": "test_receipt_1"
    })
    print(f"\nSUCCESS! Order created: {order['id']}")
    print(f"Amount: {order['amount']} paise")
    print(f"Status: {order['status']}")
except Exception as e:
    print(f"\nFAILED: {str(e)}")
