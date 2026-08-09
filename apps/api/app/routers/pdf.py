from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models import DocumentConfigModel, TemplateModel
from app.schemas import DocumentConfigCreate
from app.services.pdf_generator import generate_pdf_bytes

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


@router.get("/document/{document_id}", response_class=Response)
def export_document_pdf(document_id: int, db: Session = Depends(get_db)):
    """
    指定された帳票文言設定IDに基づいてPDFを生成してダウンロード/表示する
    """
    doc_config = db.query(DocumentConfigModel).options(
        joinedload(DocumentConfigModel.template)
    ).filter(DocumentConfigModel.id == document_id).first()

    if not doc_config or not doc_config.template:
        raise HTTPException(status_code=404, detail="指定された帳票データが見つかりません。")

    pdf_bytes = generate_pdf_bytes(doc_config.template, doc_config)

    filename = f"{doc_config.doc_number or 'document'}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )


@router.post("/preview", response_class=Response)
def preview_custom_pdf(payload: DocumentConfigCreate, db: Session = Depends(get_db)):
    """
    保存前のプレビュー用：送信された一時文言設定とテンプレート情報から即座にPDFを返却する
    """
    template = db.query(TemplateModel).filter(TemplateModel.id == payload.template_id).first()
    if not template:
        raise HTTPException(status_code=400, detail="有効なテンプレートIDを指定してください。")

    pdf_bytes = generate_pdf_bytes(template, payload)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'inline; filename="preview.pdf"'
        }
    )
