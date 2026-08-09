# REST API 仕様書 (API Specification)

## 1. 概要
DocForge FastAPI バックエンドが提供する RESTful API 仕様書です。

* **Base URL**: `http://localhost:8000/api` (Next.js プロキシ経由時: `/api`)
* **データフォーマット**: JSON (`application/json`) / PDF (`application/pdf`)

---

## 2. エンドポイント一覧

| カテゴリ | メソッド | パス | 概要 |
|---|---|---|---|
| テンプレート | `GET` | `/api/templates` | 全テンプレート一覧取得 |
| テンプレート | `POST` | `/api/templates` | 新規テンプレート作成 |
| テンプレート | `GET` | `/api/templates/{id}` | 特定テンプレート詳細取得 |
| テンプレート | `PUT` | `/api/templates/{id}` | テンプレート更新 |
| テンプレート | `DELETE` | `/api/templates/{id}` | テンプレート削除 |
| 帳票書類 | `GET` | `/api/documents` | 全帳票書類一覧取得 |
| 帳票書類 | `POST` | `/api/documents` | 新規帳票書類作成 |
| 帳票書類 | `GET` | `/api/documents/{id}` | 特定帳票書類詳細取得 |
| 帳票書類 | `PUT` | `/api/documents/{id}` | 帳票書類更新 |
| 帳票書類 | `DELETE` | `/api/documents/{id}` | 帳票書類削除 |
| PDF出力 | `GET` | `/api/pdf/document/{id}` | 保存済み書類の PDF 出力 (バイナリストリーム) |
| PDF出力 | `POST` | `/api/pdf/preview` | 一時入力データからの即時 PDF プレビュー生成 |

---

## 3. 各エンドポイント詳細仕様

### 3.1 テンプレート API (`/api/templates`)

#### GET `/api/templates`
* **レスポンス**: `200 OK`
* **Body**: `TemplateResponse[]`

#### POST `/api/templates`
* **リクエスト**: `201 Created`
* **Body (TemplateCreate)**:
```json
{
  "name": "標準請求書 (A4縦)",
  "doc_type": "INVOICE",
  "paper_size": "A4",
  "orientation": "portrait",
  "width_mm": 210.0,
  "height_mm": 297.0,
  "margin_top_mm": 15.0,
  "margin_bottom_mm": 15.0,
  "margin_left_mm": 15.0,
  "margin_right_mm": 15.0,
  "layout_config": {
    "primary_color": "#1E3A8A",
    "secondary_color": "#F3F4F6"
  },
  "description": "標準A4テンプレート"
}
```

---

### 3.2 帳票書類 API (`/api/documents`)

#### GET `/api/documents`
* **レスポンス**: `200 OK`
* **Body**: `DocumentConfigResponse[]` (アタッチされている `template` オブジェクトを含む)

#### POST `/api/documents`
* **リクエスト**: `201 Created`
* **Body (DocumentConfigCreate)**:
```json
{
  "template_id": 1,
  "title": "御 請 求 書",
  "doc_number": "INV-2026-001",
  "issue_date": "2026-08-09",
  "due_date": "2026-09-30",
  "sender_info": {
    "company_name": "DocForge ソリューションズ株式会社",
    "postal_code": "100-0005",
    "address": "東京都千代田区丸の内1-2-3",
    "tel": "03-1234-5678",
    "registration_number": "T1234567890123"
  },
  "recipient_info": {
    "company_name": "株式会社サンプル",
    "department": "営業部",
    "contact_person": "山田 太郎",
    "honorific": "御中"
  },
  "items": [
    {
      "name": "Web帳票システム 画面開発",
      "quantity": 1,
      "unit": "式",
      "unit_price": 350000,
      "tax_rate": 10
    }
  ],
  "custom_texts": {
    "subject": "2026年8月度 システム開発費用のご請求",
    "notes": "毎度格別のご愛顧を賜り厚く御礼申し上げます。",
    "bank_info": "みずほ銀行 丸の内支店 (100) 普通 1234567"
  },
  "tax_rate_default": 10.0,
  "status": "completed"
}
```

---

### 3.3 PDF 出力 API (`/api/pdf`)

#### GET `/api/pdf/document/{document_id}`
* **レスポンス**: `200 OK`
* **Headers**: `Content-Type: application/pdf`, `Content-Disposition: inline; filename="{doc_number}.pdf"`
* **Body**: PDF バイナリデータ

#### POST `/api/pdf/preview`
* **リクエスト**: `200 OK` (一時フォーム入力パラメータから即時レンダリング)
* **Headers**: `Content-Type: application/pdf`
* **Body**: PDF バイナリデータ
