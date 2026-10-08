from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.user_model import User
from auth.auth_handler import verify_token


def get_current_user(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if (user.role or "user") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
