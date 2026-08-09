from sqlalchemy.orm import Session
from app.models import TenantModel, UserModel, TemplateModel, DocumentConfigModel
from app.auth import hash_password


def seed_initial_data(db: Session):
    """初期プラットフォーム管理者、テナント、各種ロールユーザーのシード投入"""
    # 1. プラットフォーム用システムテナント
    platform_tenant = db.query(TenantModel).filter(TenantModel.code == "platform-admin").first()
    if not platform_tenant:
        platform_tenant = TenantModel(
            name="DocForge プラットフォーム運営本部",
            code="platform-admin",
            plan="enterprise",
            status="active"
        )
        db.add(platform_tenant)
        db.commit()
        db.refresh(platform_tenant)

    # 2. デモ企業テナント
    demo_tenant = db.query(TenantModel).filter(TenantModel.code == "docforge-demo").first()
    if not demo_tenant:
        demo_tenant = TenantModel(
            name="サンプル商事株式会社",
            code="docforge-demo",
            plan="standard",
            status="active"
        )
        db.add(demo_tenant)
        db.commit()
        db.refresh(demo_tenant)

    # 3. ユーザー作成 (SUPER_ADMIN, TENANT_ADMIN, TENANT_USER)
    # 3-1. プラットフォーム管理者
    super_admin = db.query(UserModel).filter(UserModel.email == "superadmin@docforge.com").first()
    if not super_admin:
        super_admin = UserModel(
            tenant_id=platform_tenant.id,
            email="superadmin@docforge.com",
            password_hash=hash_password("superadmin123"),
            full_name="プラットフォーム総括管理者",
            role="SUPER_ADMIN",
            is_active=True
        )
        db.add(super_admin)

    # 3-2. テナント管理者
    tenant_admin = db.query(UserModel).filter(UserModel.email == "tenantadmin@docforge.com").first()
    if not tenant_admin:
        tenant_admin = UserModel(
            tenant_id=demo_tenant.id,
            email="tenantadmin@docforge.com",
            password_hash=hash_password("admin123"),
            full_name="サンプル商事 テナント管理者",
            role="TENANT_ADMIN",
            is_active=True
        )
        db.add(tenant_admin)

    # 3-3. 一般テナントユーザー
    tenant_user = db.query(UserModel).filter(UserModel.email == "user@docforge.com").first()
    if not tenant_user:
        tenant_user = UserModel(
            tenant_id=demo_tenant.id,
            email="user@docforge.com",
            password_hash=hash_password("user123"),
            full_name="一般ユーザー 鈴木",
            role="TENANT_USER",
            is_active=True
        )
        db.add(tenant_user)

    db.commit()

    if db.query(TemplateModel).count() > 0:
        return

    # 4. テンプレート初期データ
    template_invoice = TemplateModel(
        tenant_id=demo_tenant.id,
        name="標準請求書（A4縦・ネイビー）",
        doc_type="INVOICE",
        paper_size="A4",
        orientation="portrait",
        width_mm=210.0,
        height_mm=297.0,
        margin_top_mm=15.0,
        margin_bottom_mm=15.0,
        margin_left_mm=15.0,
        margin_right_mm=15.0,
        layout_config={
            "primary_color": "#1E3A8A",
            "secondary_color": "#F3F4F6",
            "show_seal": True,
        },
        description="一般的な取引向けのA4縦型請求書テンプレートです。"
    )

    template_po = TemplateModel(
        tenant_id=demo_tenant.id,
        name="標準発注書（A4縦・グリーン）",
        doc_type="PURCHASE_ORDER",
        paper_size="A4",
        orientation="portrait",
        width_mm=210.0,
        height_mm=297.0,
        margin_top_mm=15.0,
        margin_bottom_mm=15.0,
        margin_left_mm=15.0,
        margin_right_mm=15.0,
        layout_config={
            "primary_color": "#047857",
            "secondary_color": "#ECFDF5",
            "show_seal": True,
        },
        description="資材・サービス購入用のA4縦型発注書テンプレートです。"
    )

    template_quote = TemplateModel(
        tenant_id=demo_tenant.id,
        name="標準見積書（A4縦・オレンジ）",
        doc_type="QUOTATION",
        paper_size="A4",
        orientation="portrait",
        width_mm=210.0,
        height_mm=297.0,
        margin_top_mm=15.0,
        margin_bottom_mm=15.0,
        margin_left_mm=15.0,
        margin_right_mm=15.0,
        layout_config={
            "primary_color": "#C2410C",
            "secondary_color": "#FFF7ED",
            "show_seal": False,
        },
        description="新規案件・提案用のA4縦型見積書テンプレートです。"
    )

    db.add(template_invoice)
    db.add(template_po)
    db.add(template_quote)
    db.commit()
    db.refresh(template_invoice)

    # 5. 書類初期データ
    doc_invoice = DocumentConfigModel(
        tenant_id=demo_tenant.id,
        template_id=template_invoice.id,
        title="御 請 求 書",
        doc_number="INV-2026-0801",
        issue_date="2026-08-10",
        due_date="2026-09-30",
        sender_info={
            "company_name": "サンプル商事株式会社",
            "postal_code": "100-0005",
            "address": "東京都千代田区丸の内1-2-3 丸の内ビル 15F",
            "tel": "03-1234-5678",
            "email": "billing@sample-corp.example.com",
            "registration_number": "T1234567890123"
        },
        recipient_info={
            "company_name": "株式会社テッククラウド",
            "department": "開発事業部",
            "contact_person": "山田 太郎",
            "honorific": "御中"
        },
        items=[
            {
                "name": "Web帳票管理システム 画面開発",
                "quantity": 1,
                "unit": "式",
                "unit_price": 450000,
                "tax_rate": 10
            }
        ],
        custom_texts={
            "subject": "2026年8月度 システム開発費用ご請求の件",
            "notes": "毎度格別のご愛顧を賜り厚く御礼申し上げます。",
            "bank_info": "みずほ銀行 丸の内支店 (100) 普通 1234567\nカ）サンプルショウジ",
            "payment_terms": "翌月末銀行振込"
        },
        tax_rate_default=10.0,
        status="completed"
    )

    db.add(doc_invoice)
    db.commit()
