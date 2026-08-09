import io
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, B5, A5, landscape as rl_landscape
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.cidfonts import UnicodeCIDFont


def init_fonts():
    """
    日本語TrueTypeフォント(IPAフォント)を検索してReportLabに埋め込みフォントとして登録する。
    PDF自体にフォントデータを埋め込むことで、どの端末・PDFビューアでも文字化けせずに完全表示される。
    """
    possible_fonts = [
        ('IPAGothic', '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'),
        ('IPAMincho', '/usr/share/fonts/opentype/ipafont-mincho/ipam.ttf'),
        ('IPAGothic', '/usr/share/fonts/truetype/ipafont-gothic/ipag.ttf'),
        ('IPAMincho', '/usr/share/fonts/truetype/ipafont-mincho/ipam.ttf'),
        ('IPAGothic', '/usr/share/fonts/truetype/fonts-japanese-gothic.ttf'),
        ('IPAMincho', '/usr/share/fonts/truetype/fonts-japanese-mincho.ttf'),
    ]

    registered = {}
    for font_name, font_path in possible_fonts:
        if os.path.exists(font_path) and font_name not in registered:
            try:
                pdfmetrics.registerFont(TTFont(font_name, font_path))
                registered[font_name] = True
            except Exception as e:
                print(f"Font registration failed for {font_path}: {e}")

    # ヘッダー用・本文用のフォント定義
    if 'IPAGothic' in registered:
        header_font = 'IPAGothic'
    elif 'IPAMincho' in registered:
        header_font = 'IPAMincho'
    else:
        try:
            pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKaku-W5'))
            header_font = 'HeiseiKaku-W5'
        except:
            header_font = 'Helvetica-Bold'

    if 'IPAMincho' in registered:
        body_font = 'IPAMincho'
    elif 'IPAGothic' in registered:
        body_font = 'IPAGothic'
    else:
        try:
            pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
            body_font = 'HeiseiMin-W3'
        except:
            body_font = 'Helvetica'

    return body_font, header_font


DEFAULT_FONT, HEADER_FONT = init_fonts()


def get_page_size(paper_size: str, orientation: str, width_mm: float = 210, height_mm: float = 297):
    """用紙サイズと向きから (幅, 高さ) のポイント数を算出"""
    paper_size_upper = paper_size.upper() if paper_size else "A4"
    if paper_size_upper == "A4":
        size = A4
    elif paper_size_upper == "B5":
        size = B5
    elif paper_size_upper == "A5":
        size = A5
    elif paper_size_upper == "CUSTOM" and width_mm and height_mm:
        size = (width_mm * mm, height_mm * mm)
    else:
        size = A4

    if orientation == "landscape":
        return rl_landscape(size)
    return size


def generate_pdf_bytes(template, doc_config) -> bytes:
    """
    テンプレート設定と帳票文言設定からPDFを生成しバイナリを返す
    """
    buffer = io.BytesIO()

    # フォントの最新チェック（必要に応じ再登録）
    body_font, header_font = init_fonts()

    page_size = get_page_size(
        template.paper_size,
        template.orientation,
        template.width_mm,
        template.height_mm
    )

    top_margin = (template.margin_top_mm or 15) * mm
    bottom_margin = (template.margin_bottom_mm or 15) * mm
    left_margin = (template.margin_left_mm or 15) * mm
    right_margin = (template.margin_right_mm or 15) * mm

    send = doc_config.sender_info or {}
    pdf_title = f"{doc_config.title or '帳票'} ({doc_config.doc_number or ''})".strip()
    pdf_author = send.get("company_name") or "DocForge Solutions"

    pdf_doc = SimpleDocTemplate(
        buffer,
        pagesize=page_size,
        leftMargin=left_margin,
        rightMargin=right_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin,
        title=pdf_title,
        author=pdf_author,
        subject=doc_config.doc_number or "帳票PDF",
        creator="DocForge Report Engine"
    )


    page_width = page_size[0] - left_margin - right_margin

    # テーマカラー設定 (layout_config より)
    layout = template.layout_config or {}
    primary_color_hex = layout.get("primary_color", "#1E3A8A")
    secondary_color_hex = layout.get("secondary_color", "#F3F4F6")
    
    primary_color = colors.HexColor(primary_color_hex)
    secondary_color = colors.HexColor(secondary_color_hex)
    text_color = colors.HexColor("#1F2937")

    # スタイル定義
    style_title = ParagraphStyle(
        'DocTitle',
        fontName=header_font,
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor=primary_color,
        spaceAfter=15
    )

    style_sub = ParagraphStyle(
        'DocSub',
        fontName=body_font,
        fontSize=10,
        leading=14,
        textColor=text_color
    )

    style_bold = ParagraphStyle(
        'DocBold',
        fontName=header_font,
        fontSize=10,
        leading=14,
        textColor=text_color
    )

    style_right = ParagraphStyle(
        'DocRight',
        fontName=body_font,
        fontSize=9,
        leading=13,
        alignment=TA_RIGHT,
        textColor=text_color
    )

    style_th = ParagraphStyle(
        'TableHead',
        fontName=header_font,
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.white
    )

    style_td = ParagraphStyle(
        'TableBody',
        fontName=body_font,
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
        textColor=text_color
    )

    style_td_center = ParagraphStyle(
        'TableBodyCenter',
        fontName=body_font,
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=text_color
    )

    style_td_right = ParagraphStyle(
        'TableBodyRight',
        fontName=body_font,
        fontSize=9,
        leading=12,
        alignment=TA_RIGHT,
        textColor=text_color
    )

    elements = []

    # 1. ヘッダータイトル
    doc_title_text = doc_config.title or "請求書"
    elements.append(Paragraph(f"<b>{doc_title_text}</b>", style_title))
    elements.append(Spacer(1, 5 * mm))

    # 2. 発行情報 (発行日, 帳票番号)
    meta_info_lines = []
    if doc_config.doc_number:
        meta_info_lines.append(f"<b>番号:</b> {doc_config.doc_number}")
    if doc_config.issue_date:
        meta_info_lines.append(f"<b>発行日:</b> {doc_config.issue_date}")
    if doc_config.due_date:
        meta_info_lines.append(f"<b>支払期日:</b> {doc_config.due_date}")

    meta_html = "<br/>".join(meta_info_lines)

    # 3. 宛先情報 & 発行元情報
    rec = doc_config.recipient_info or {}
    send = doc_config.sender_info or {}

    rec_name = rec.get("company_name", "")
    honorific = rec.get("honorific", "御中")
    rec_dept = rec.get("department", "")
    rec_person = rec.get("contact_person", "")

    rec_html = f"<font size=12><b>{rec_name} {honorific}</b></font><br/>"
    if rec_dept:
        rec_html += f"{rec_dept}<br/>"
    if rec_person:
        rec_html += f"ご担当: {rec_person} 様<br/>"

    # 件名
    custom = doc_config.custom_texts or {}
    subject = custom.get("subject", "")
    if subject:
        rec_html += f"<br/><b>件名:</b> {subject}"

    send_name = send.get("company_name", "")
    send_zip = send.get("postal_code", "")
    send_addr = send.get("address", "")
    send_tel = send.get("tel", "")
    send_email = send.get("email", "")
    send_reg = send.get("registration_number", "")

    send_html = f"<b>{send_name}</b><br/>"
    if send_zip:
        send_html += f"〒{send_zip}<br/>"
    if send_addr:
        send_html += f"{send_addr}<br/>"
    if send_tel:
        send_html += f"TEL: {send_tel}<br/>"
    if send_email:
        send_html += f"Email: {send_email}<br/>"
    if send_reg:
        send_html += f"登録番号: {send_reg}<br/>"

    col_width_left = page_width * 0.52
    col_width_right = page_width * 0.48

    top_table_data = [
        [
            Paragraph(rec_html, style_sub),
            Paragraph(f"{meta_html}<br/><br/>{send_html}", style_right)
        ]
    ]

    top_table = Table(top_table_data, colWidths=[col_width_left, col_width_right])
    top_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(top_table)
    elements.append(Spacer(1, 6 * mm))

    # 4. 明細計算
    items = doc_config.items or []
    subtotal = 0.0
    tax_summary = {}

    for item in items:
        qty = float(item.get("quantity", 1.0))
        price = float(item.get("unit_price", 0.0))
        tax_r = float(item.get("tax_rate", doc_config.tax_rate_default or 10.0))
        amount = qty * price
        subtotal += amount
        
        tax_amt = amount * (tax_r / 100.0)
        tax_summary[tax_r] = tax_summary.get(tax_r, 0.0) + tax_amt

    total_tax = sum(tax_summary.values())
    grand_total = subtotal + total_tax

    # 5. ご請求金額ハイライト
    total_box_data = [
        [
            Paragraph("<font size=11><b>ご請求金額 (税込)</b></font>", style_sub),
            Paragraph(f"<font size=15><b>¥{int(round(grand_total)):,} -</b></font>", style_bold)
        ]
    ]
    total_box_table = Table(total_box_data, colWidths=[page_width * 0.4, page_width * 0.6])
    total_box_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), secondary_color),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(total_box_table)
    elements.append(Spacer(1, 6 * mm))

    # 6. 明細テーブル
    w_name = page_width * 0.38
    w_qty = page_width * 0.12
    w_unit = page_width * 0.10
    w_price = page_width * 0.18
    w_amount = page_width * 0.22

    table_data = [
        [
            Paragraph("<b>品名 / 内容</b>", style_th),
            Paragraph("<b>数量</b>", style_th),
            Paragraph("<b>単位</b>", style_th),
            Paragraph("<b>単価 (円)</b>", style_th),
            Paragraph("<b>金額 (円)</b>", style_th),
        ]
    ]

    for item in items:
        name_str = item.get("name", "")
        qty = float(item.get("quantity", 1.0))
        unit = item.get("unit", "式")
        price = float(item.get("unit_price", 0.0))
        amount = qty * price

        table_data.append([
            Paragraph(name_str, style_td),
            Paragraph(f"{qty:g}", style_td_center),
            Paragraph(unit, style_td_center),
            Paragraph(f"¥{int(round(price)):,}", style_td_right),
            Paragraph(f"¥{int(round(amount)):,}", style_td_right),
        ])

    min_rows = 5
    if len(items) < min_rows:
        for _ in range(min_rows - len(items)):
            table_data.append([
                Paragraph("", style_td),
                Paragraph("", style_td_center),
                Paragraph("", style_td_center),
                Paragraph("", style_td_right),
                Paragraph("", style_td_right),
            ])

    item_table = Table(table_data, colWidths=[w_name, w_qty, w_unit, w_price, w_amount])
    
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]

    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#F9FAFB")))

    item_table.setStyle(TableStyle(t_style))
    elements.append(item_table)
    elements.append(Spacer(1, 4 * mm))

    # 7. 合計集計テーブル
    summary_data = [
        [Paragraph("<b>小計 (税抜):</b>", style_td_right), Paragraph(f"¥{int(round(subtotal)):,}", style_td_right)],
    ]
    for rate, tax_val in tax_summary.items():
        summary_data.append([
            Paragraph(f"<b>消費税 ({rate:g}%):</b>", style_td_right),
            Paragraph(f"¥{int(round(tax_val)):,}", style_td_right)
        ])
    summary_data.append([
        Paragraph("<b>合計 (税込):</b>", style_bold),
        Paragraph(f"<b>¥{int(round(grand_total)):,}</b>", style_bold)
    ])

    summary_table = Table(summary_data, colWidths=[page_width * 0.25, page_width * 0.25])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))

    summary_wrapper = Table([[Paragraph("", style_td), summary_table]], colWidths=[page_width * 0.5, page_width * 0.5])
    summary_wrapper.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(summary_wrapper)
    elements.append(Spacer(1, 6 * mm))

    # 8. 振込先・備考
    bank_info = custom.get("bank_info", "")
    payment_terms = custom.get("payment_terms", "")
    notes = custom.get("notes", "")

    footer_content = []
    if bank_info:
        bank_html = bank_info.replace('\n', '<br/>')
        footer_content.append(f"<b>【お振込先】</b><br/>{bank_html}")
    if payment_terms:
        pay_html = payment_terms.replace('\n', '<br/>')
        footer_content.append(f"<b>【お支払条件】</b><br/>{pay_html}")
    if notes:
        notes_html = notes.replace('\n', '<br/>')
        footer_content.append(f"<b>【備考】</b><br/>{notes_html}")

    if footer_content:
        footer_html = "<br/><br/>".join(footer_content)
        footer_table = Table([[Paragraph(footer_html, style_sub)]], colWidths=[page_width])
        footer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(footer_table)

    # PDF生成
    pdf_doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
