from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import TemplateModel, UserModel
from app.schemas import TemplateCreate, TemplateUpdate, TemplateResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=List[TemplateResponse])
def get_templates(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """自テナントのテンプレート一覧を取得（ログイン必須）"""
    if current_user.role == "SUPER_ADMIN":
        return db.query(TemplateModel).order_by(TemplateModel.id.desc()).all()
    return db.query(TemplateModel).filter(
        TemplateModel.tenant_id == current_user.tenant_id
    ).order_by(TemplateModel.id.desc()).all()


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template_in: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """自テナント用の新規テンプレートを作成（ログイン必須）"""
    data = template_in.model_dump(exclude={"tenant_id"})
    data["tenant_id"] = current_user.tenant_id
    
    db_template = TemplateModel(**data)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(TemplateModel).filter(TemplateModel.id == template_id)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(TemplateModel.tenant_id == current_user.tenant_id)
    
    template = query.first()
    if not template:
        raise HTTPException(status_code=404, detail="指定されたテンプレートが見つかりません。")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_in: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(TemplateModel).filter(TemplateModel.id == template_id)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(TemplateModel.tenant_id == current_user.tenant_id)

    db_template = query.first()
    if not db_template:
        raise HTTPException(status_code=404, detail="更新対象のテンプレートが見つかりません。")

    update_data = template_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_template, key, value)

    db.commit()
    db.refresh(db_template)
    return db_template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(TemplateModel).filter(TemplateModel.id == template_id)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(TemplateModel.tenant_id == current_user.tenant_id)

    db_template = query.first()
    if not db_template:
        raise HTTPException(status_code=404, detail="削除対象のテンプレートが見つかりません。")

    db.delete(db_template)
    db.commit()
    return None
