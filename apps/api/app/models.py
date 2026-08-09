from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(100), unique=True, nullable=False, index=True)
    plan = Column(String(50), nullable=False, default="standard")  # free, standard, enterprise
    status = Column(String(20), nullable=False, default="active")  # active, suspended

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users = relationship("UserModel", back_populates="tenant", cascade="all, delete-orphan")
    templates = relationship("TemplateModel", back_populates="tenant", cascade="all, delete-orphan")
    documents = relationship("DocumentConfigModel", back_populates="tenant", cascade="all, delete-orphan")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="ADMIN")  # ADMIN, MEMBER
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("TenantModel", back_populates="users")


class TemplateModel(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, default=1)
    
    name = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False, default="INVOICE")  # INVOICE, PURCHASE_ORDER, QUOTATION, DELIVERY_NOTE, RECEIPT
    paper_size = Column(String(20), nullable=False, default="A4")     # A4, B5, A5, CUSTOM
    orientation = Column(String(20), nullable=False, default="portrait") # portrait, landscape
    width_mm = Column(Float, nullable=True, default=210.0)
    height_mm = Column(Float, nullable=True, default=297.0)
    margin_top_mm = Column(Float, nullable=False, default=15.0)
    margin_bottom_mm = Column(Float, nullable=False, default=15.0)
    margin_left_mm = Column(Float, nullable=False, default=15.0)
    margin_right_mm = Column(Float, nullable=False, default=15.0)
    
    layout_config = Column(JSON, nullable=False, default=dict)
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("TenantModel", back_populates="templates")
    documents = relationship("DocumentConfigModel", back_populates="template", cascade="all, delete-orphan")


class DocumentConfigModel(Base):
    __tablename__ = "document_configs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, default=1)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    doc_number = Column(String(100), nullable=False)
    issue_date = Column(String(50), nullable=False)
    due_date = Column(String(50), nullable=True)
    
    sender_info = Column(JSON, nullable=False, default=dict)
    recipient_info = Column(JSON, nullable=False, default=dict)
    items = Column(JSON, nullable=False, default=list)
    custom_texts = Column(JSON, nullable=False, default=dict)
    
    tax_rate_default = Column(Float, nullable=False, default=10.0)
    status = Column(String(20), nullable=False, default="draft")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("TenantModel", back_populates="documents")
    template = relationship("TemplateModel", back_populates="documents")
