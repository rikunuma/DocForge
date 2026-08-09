from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import UserModel, TenantModel
from app.schemas import UserCreate, UserResponse
from app.auth import hash_password, require_tenant_admin

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_tenant_admin)
):
    """
    ユーザー一覧取得
    - SUPER_ADMIN: 全ユーザーを取得
    - TENANT_ADMIN: 自テナントのユーザーのみ取得
    """
    query = db.query(UserModel).options(joinedload(UserModel.tenant))
    if current_user.role == "TENANT_ADMIN":
        query = query.filter(UserModel.tenant_id == current_user.tenant_id)
    
    return query.order_by(UserModel.id.desc()).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_tenant_admin)
):
    """
    新規ユーザー登録
    - SUPER_ADMIN: 任意テナントのユーザー（テナント管理者含め）を作成可能
    - TENANT_ADMIN: 自テナント内のユーザーのみ作成可能
    """
    existing = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="このメールアドレスは既に登録されています。")

    # テナント管理者の場合は自テナント強制
    if current_user.role == "TENANT_ADMIN":
        target_tenant_id = current_user.tenant_id
        # テナント管理者がSUPER_ADMINを作成することを防ぐ
        if user_in.role == "SUPER_ADMIN":
            raise HTTPException(status_code=403, detail="テナント管理者はプラットフォーム管理者を作成できません。")
    else:
        target_tenant_id = user_in.tenant_id or current_user.tenant_id

    tenant = db.query(TenantModel).filter(TenantModel.id == target_tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=400, detail="指定されたテナントが見つかりません。")

    hashed_pwd = hash_password(user_in.password)
    
    user_dict = user_in.model_dump(exclude={"password", "tenant_id"})
    user_dict["tenant_id"] = target_tenant_id
    user_dict["password_hash"] = hashed_pwd

    db_user = UserModel(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db.query(UserModel).options(
        joinedload(UserModel.tenant)
    ).filter(UserModel.id == db_user.id).first()
