from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import TenantModel, UserModel
from app.schemas import TenantCreate, TenantResponse
from app.auth import require_super_admin

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


@router.get("", response_model=List[TenantResponse])
def get_tenants(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_super_admin)
):
    """【プラットフォーム管理者専用】全テナント一覧取得"""
    return db.query(TenantModel).order_by(TenantModel.id.asc()).all()


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
def create_tenant(
    tenant_in: TenantCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_super_admin)
):
    """【プラットフォーム管理者専用】新規契約テナント作成"""
    existing = db.query(TenantModel).filter(TenantModel.code == tenant_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="この識別コードは既に使用されています。")

    db_tenant = TenantModel(**tenant_in.model_dump())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_super_admin)
):
    """【プラットフォーム管理者専用】特定テナント詳細取得"""
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="テナントが見つかりません。")
    return tenant
