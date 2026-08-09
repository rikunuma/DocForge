import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db

SECRET_KEY = "docforge-super-secret-jwt-key-for-tenant-auth"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7日間有効

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            return None
    except jwt.PyJWTError:
        return None

    from app.models import UserModel
    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.is_active == True).first()
    return user


def get_current_user(user = Depends(get_current_user_optional)):
    """ログイン必須ガード"""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ログイン認証が必要です。ログインしてからお試しください。",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_super_admin(user = Depends(get_current_user)):
    """プラットフォーム管理者 (SUPER_ADMIN) 専用ガード"""
    if user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作はプラットフォーム管理者のみ実行できます。"
        )
    return user


def require_tenant_admin(user = Depends(get_current_user)):
    """テナント管理者以上 (SUPER_ADMIN または TENANT_ADMIN) 専用ガード"""
    if user.role not in ["SUPER_ADMIN", "TENANT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作はテナント管理者以上の権限が必要です。"
        )
    return user
