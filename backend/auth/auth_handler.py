from passlib.context import CryptContext

from jose import jwt, JWTError

from datetime import datetime, timedelta

from fastapi import Depends, HTTPException

from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "mysecretkey"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(

    tokenUrl="login"
)

pwd_context = CryptContext(

    schemes=["sha256_crypt"],

    deprecated="auto"
)

def hash_password(password: str):

    print(f"DEBUG: Password length = {len(password)}")

    return pwd_context.hash(password)

def verify_password(

    plain_password,

    hashed_password
):

    return pwd_context.verify(

        plain_password,

        hashed_password
    )

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(

        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({

        "exp": expire
    })

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:

            raise HTTPException(

                status_code=401,

                detail="Invalid token"
            )

        return email

    except JWTError:

        raise HTTPException(

            status_code=401,

            detail="Invalid token"
        )
