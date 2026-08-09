from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db, engine, Base
from app.models import TenantModel, UserModel, TemplateModel, DocumentConfigModel
from app.routers import templates, documents, pdf, auth, tenants, users
from app.seed import seed_initial_data

# テーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DocForge API - マルチテナント帳票プラットフォーム",
    description="Next.js, FastAPI, PostgreSQLによるマルチテナント対応帳票作成・認証・PDF出力API",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_initial_data(db)
    finally:
        db.close()


# ルーター登録
app.include_router(auth.router)
app.include_router(tenants.router)
app.include_router(users.router)
app.include_router(templates.router)
app.include_router(documents.router)
app.include_router(pdf.router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to DocForge Multi-Tenant API",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).scalar()
        return {
            "status": "connected",
            "result": result,
            "database": settings.POSTGRES_DB
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
