from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db

app = FastAPI(title=settings.PROJECT_NAME)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to DocForge API",
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
