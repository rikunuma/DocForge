from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import DocumentConfigModel, TemplateModel, UserModel
from app.schemas import DocumentConfigCreate, DocumentConfigUpdate, DocumentConfigResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=List[DocumentConfigResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """自テナントの帳票書類一覧を取得（ログイン必須）"""
    query = db.query(DocumentConfigModel).options(joinedload(DocumentConfigModel.template))
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(DocumentConfigModel.tenant_id == current_user.tenant_id)
        
    return query.order_by(DocumentConfigModel.id.desc()).all()


@router.post("", response_model=DocumentConfigResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    doc_in: DocumentConfigCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """自テナント用の新規帳票を作成（ログイン必須）"""
    data = doc_in.model_dump(exclude={"tenant_id"})
    data["tenant_id"] = current_user.tenant_id

    db_doc = DocumentConfigModel(**data)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return db.query(DocumentConfigModel).options(
        joinedload(DocumentConfigModel.template)
    ).filter(DocumentConfigModel.id == db_doc.id).first()


@router.get("/{document_id}", response_model=DocumentConfigResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(DocumentConfigModel).options(
        joinedload(DocumentConfigModel.template)
    ).filter(DocumentConfigModel.id == document_id)

    if current_user.role != "SUPER_ADMIN":
        query = query.filter(DocumentConfigModel.tenant_id == current_user.tenant_id)

    doc = query.first()
    if not doc:
        raise HTTPException(status_code=404, detail="指定された帳票が見つかりません。")
    return doc


@router.put("/{document_id}", response_model=DocumentConfigResponse)
def update_document(
    document_id: int,
    doc_in: DocumentConfigUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(DocumentConfigModel).filter(DocumentConfigModel.id == document_id)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(DocumentConfigModel.tenant_id == current_user.tenant_id)

    db_doc = query.first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="更新対象の帳票が見つかりません。")

    update_data = doc_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_doc, key, value)

    db.commit()
    
    return db.query(DocumentConfigModel).options(
        joinedload(DocumentConfigModel.template)
    ).filter(DocumentConfigModel.id == db_doc.id).first()


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(DocumentConfigModel).filter(DocumentConfigModel.id == document_id)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(DocumentConfigModel.tenant_id == current_user.tenant_id)

    db_doc = query.first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="削除対象の帳票が見つかりません。")

    db.delete(db_doc)
    db.commit()
    return None
