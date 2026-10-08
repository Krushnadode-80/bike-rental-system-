import requests

user_data = {
    "email": "test_login@gmail.com",
    "password": "password123",
    "role": "user",
    "name": "Login Test"
}

# 1. Register
requests.post('http://127.0.0.1:8000/register', json=user_data)

# 2. Login
login_data = {
    "email": "test_login@gmail.com",
    "password": "password123"
}

try:
    r = requests.post('http://127.0.0.1:8000/login', json=login_data)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Error: {e}")
