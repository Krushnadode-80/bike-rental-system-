from auth.auth_handler import hash_password

try:
    p = "password123"
    h = hash_password(p)
    print(f"Hashed: {h}")
except Exception as e:
    print(f"Bcrypt Error: {e}")
