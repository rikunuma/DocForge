from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# --- Tenant Schemas ---
class TenantBase(BaseModel):
    name: str = Field(..., description="企業・組織名")
    code: str = Field(..., description="テナント識別コード (例: demo-corp)")
    plan: str = Field("standard", description="利用プラン (free, standard, enterprise)")
    status: str = Field("active", description="ステータス (active, suspended)")


class TenantCreate(TenantBase):
    pass


class TenantResponse(TenantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- User Schemas ---
class UserBase(BaseModel):
    email: str = Field(..., description="ログイン用メールアドレス")
    full_name: str = Field(..., description="ユーザー氏名")
    role: str = Field("ADMIN", description="ロール (ADMIN, MEMBER)")
    is_active: bool = True


class UserCreate(UserBase):
    tenant_id: Optional[int] = None
    password: str = Field(..., min_length=6, description="パスワード")


class UserResponse(UserBase):
    id: int
    tenant_id: int
    tenant: Optional[TenantResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Item Schema ---
class InvoiceItem(BaseModel):
    name: str = Field(..., description="品名 / サービス名")
    quantity: float = Field(1.0, description="数量")
    unit: Optional[str] = Field("式", description="単位 (個, 式, 時間, 月 など)")
    unit_price: float = Field(0.0, description="単価")
    tax_rate: float = Field(10.0, description="消費税率 (%)")


# --- Template Schemas ---
class TemplateBase(BaseModel):
    name: str
    doc_type: str = "INVOICE"
    paper_size: str = "A4"
    orientation: str = "portrait"
    width_mm: Optional[float] = 210.0
    height_mm: Optional[float] = 297.0
    margin_top_mm: float = 15.0
    margin_bottom_mm: float = 15.0
    margin_left_mm: float = 15.0
    margin_right_mm: float = 15.0
    layout_config: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None


class TemplateCreate(TemplateBase):
    tenant_id: Optional[int] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    doc_type: Optional[str] = None
    paper_size: Optional[str] = None
    orientation: Optional[str] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    margin_top_mm: Optional[float] = None
    margin_bottom_mm: Optional[float] = None
    margin_left_mm: Optional[float] = None
    margin_right_mm: Optional[float] = None
    layout_config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class TemplateResponse(TemplateBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Document Config Schemas ---
class DocumentConfigBase(BaseModel):
    template_id: int
    title: str
    doc_number: str
    issue_date: str
    due_date: Optional[str] = ""
    sender_info: Dict[str, Any] = Field(default_factory=dict)
    recipient_info: Dict[str, Any] = Field(default_factory=dict)
    items: List[Dict[str, Any]] = Field(default_factory=list)
    custom_texts: Dict[str, Any] = Field(default_factory=dict)
    tax_rate_default: float = 10.0
    status: str = "draft"


class DocumentConfigCreate(DocumentConfigBase):
    tenant_id: Optional[int] = None


class DocumentConfigUpdate(BaseModel):
    template_id: Optional[int] = None
    title: Optional[str] = None
    doc_number: Optional[str] = None
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    sender_info: Optional[Dict[str, Any]] = None
    recipient_info: Optional[Dict[str, Any]] = None
    items: Optional[List[Dict[str, Any]]] = None
    custom_texts: Optional[Dict[str, Any]] = None
    tax_rate_default: Optional[float] = None
    status: Optional[str] = None


class DocumentConfigResponse(DocumentConfigBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    template: Optional[TemplateResponse] = None

    class Config:
        from_attributes = True
