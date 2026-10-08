import requests
import random
import string

def get_random_string(length):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

user_data = {
    "name": "Test User",
    "email": f"test_{get_random_string(5)}@gmail.com",
    "password": "password123",
    "role": "user"
}

try:
    r = requests.post('http://127.0.0.1:8000/register', json=user_data)
    print(f"Status: {r.status_code}")
    print(f"Response Text: {r.text}")
except Exception as e:
    print(f"Connection Failed: {e}")
