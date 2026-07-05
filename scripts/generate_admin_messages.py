from __future__ import annotations

import json
import re
import secrets
import string
from pathlib import Path

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "Stuff" / "Zonal Center_21-05-2026.xlsx"
OUTPUT_DIR = ROOT / "output"
PDF_DIR = OUTPUT_DIR / "pdf"
JSON_PATH = OUTPUT_DIR / "admin-credentials.json"
MD_PATH = OUTPUT_DIR / "admin-login-messages.md"
PDF_PATH = PDF_DIR / "MAST_Admin_Login_Messages.pdf"
ADMIN_URL = "https://mastassessment-admin.netlify.app"


def slugify_dot(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", ".", value.lower()).strip(".")


def slugify_id(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def make_password(label: str) -> str:
    alphabet = string.ascii_letters + string.digits
    random_part = "".join(secrets.choice(alphabet) for _ in range(10))
    prefix = re.sub(r"[^A-Za-z0-9]", "", label).upper()[:7] or "MAST"
    return f"MAST-{prefix}-{random_part}"


def load_rows() -> list[dict[str, str | int]]:
    df = pd.read_excel(WORKBOOK)
    rows: list[dict[str, str | int]] = []
    for _, item in df.iterrows():
        rows.append(
            {
                "no": int(item["No"]),
                "zone": str(item["Zone"]),
                "center": str(item["Center"]),
            }
        )
    return rows


def message(name: str, email: str, password: str, scope: str) -> str:
    return "\n".join(
        [
            "Jay Swaminarayan.",
            "MAST Assessment admin login details:",
            f"Admin URL: {ADMIN_URL}",
            f"ID: {email}",
            f"Password: {password}",
            f"Access: {scope}",
            "Please keep this ID/password private and share only with the responsible admin.",
        ]
    )


def build_credentials() -> dict[str, object]:
    rows = load_rows()
    zones = sorted({str(row["zone"]) for row in rows})

    main_password = make_password("master")
    main_admin = {
        "role": "MASTER_ADMIN",
        "name": "MAST Main Admin",
        "email": "master@mast.local",
        "password": main_password,
        "zone": None,
        "center": None,
        "zoneId": None,
        "centerId": None,
        "message": message("MAST Main Admin", "master@mast.local", main_password, "All zones and centers"),
    }

    zone_admins = []
    for zone in zones:
        email = f"{slugify_dot(zone)}@mast.local"
        password = make_password(zone)
        zone_admins.append(
            {
                "role": "ZONE_ADMIN",
                "name": f"{zone} Zone Admin",
                "email": email,
                "password": password,
                "zone": zone,
                "center": None,
                "zoneId": f"zone-{slugify_id(zone)}",
                "centerId": None,
                "message": message(f"{zone} Zone Admin", email, password, f"{zone} zone"),
            }
        )

    center_admins = []
    seen_emails: set[str] = set()
    for row in rows:
        zone = str(row["zone"])
        center = str(row["center"])
        no = int(row["no"])
        base_email = f"{slugify_dot(center)}.{no}@mast.local"
        email = base_email
        suffix = 2
        while email in seen_emails:
            email = f"{slugify_dot(center)}.{no}.{suffix}@mast.local"
            suffix += 1
        seen_emails.add(email)
        password = make_password(center)
        center_admins.append(
            {
                "role": "CENTER_ADMIN",
                "name": f"{center} Center Admin",
                "email": email,
                "password": password,
                "zone": zone,
                "center": center,
                "zoneId": f"zone-{slugify_id(zone)}",
                "centerId": f"center-{no}",
                "message": message(f"{center} Center Admin", email, password, f"{center} center only"),
            }
        )

    return {
        "adminUrl": ADMIN_URL,
        "mainAdmin": main_admin,
        "zoneAdmins": zone_admins,
        "centerAdmins": center_admins,
    }


def write_markdown(credentials: dict[str, object]) -> None:
    lines = ["# MAST Admin Login Messages", ""]
    main_admin = credentials["mainAdmin"]
    lines.extend(["## Main Admin", "", "```text", main_admin["message"], "```", ""])

    lines.extend(["## Zone Admins", ""])
    for item in credentials["zoneAdmins"]:
        lines.extend([f"### {item['zone']}", "", "```text", item["message"], "```", ""])

    lines.extend(["## Center Admins", ""])
    for item in credentials["centerAdmins"]:
        lines.extend([f"### {item['center']} ({item['zone']})", "", "```text", item["message"], "```", ""])

    MD_PATH.write_text("\n".join(lines), encoding="utf-8")


def pdf_fonts() -> tuple[str, str]:
    font_path = Path("C:/Windows/Fonts/shruti.ttf")
    bold_font_path = Path("C:/Windows/Fonts/shrutib.ttf")
    font_name = "Helvetica"
    bold_font_name = "Helvetica-Bold"
    if font_path.exists():
        font_name = "Shruti"
        pdfmetrics.registerFont(TTFont(font_name, str(font_path)))
    if bold_font_path.exists():
        bold_font_name = "Shruti-Bold"
        pdfmetrics.registerFont(TTFont(bold_font_name, str(bold_font_path)))
    return font_name, bold_font_name


def write_pdf(credentials: dict[str, object]) -> None:
    styles = getSampleStyleSheet()
    font_name, bold_font_name = pdf_fonts()
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName=bold_font_name,
        fontSize=19,
        leading=24,
        textColor=colors.HexColor("#172033"),
        spaceAfter=10,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName=font_name,
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#172033"),
    )

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=13 * mm,
        bottomMargin=13 * mm,
        title="MAST Admin Login Messages",
    )

    story = [
        Paragraph("MAST Admin Login Messages", title_style),
        Paragraph("Main, zone-wise, and center-wise admin credentials for MAST Assessment.", body_style),
        Spacer(1, 8),
    ]

    summary_rows = [["Role", "Scope", "ID", "Password"]]
    main_admin = credentials["mainAdmin"]
    summary_rows.append(["MASTER", "All data", main_admin["email"], main_admin["password"]])
    for item in credentials["zoneAdmins"]:
        summary_rows.append(["ZONE", item["zone"], item["email"], item["password"]])
    for item in credentials["centerAdmins"]:
        summary_rows.append(["CENTER", f"{item['center']} / {item['zone']}", item["email"], item["password"]])

    table = Table(summary_rows, colWidths=[22 * mm, 50 * mm, 58 * mm, 47 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#172033")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), bold_font_name),
                ("FONTNAME", (0, 1), (-1, -1), font_name),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d7e1ee")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f9fd")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(table)
    story.append(PageBreak())

    sections = [("Main Admin", [main_admin]), ("Zone Admins", credentials["zoneAdmins"]), ("Center Admins", credentials["centerAdmins"])]
    for section_index, (title, items) in enumerate(sections):
        story.append(Paragraph(title, title_style))
        for index, item in enumerate(items):
            story.append(Paragraph(str(item["message"]).replace("\n", "<br/>"), body_style))
            if index != len(items) - 1:
                story.append(Spacer(1, 7))
        if section_index != len(sections) - 1:
            story.append(PageBreak())

    doc.build(story)


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    credentials = build_credentials()
    JSON_PATH.write_text(json.dumps(credentials, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(credentials)
    write_pdf(credentials)
    print(f"Wrote {JSON_PATH}")
    print(f"Wrote {MD_PATH}")
    print(f"Wrote {PDF_PATH}")


if __name__ == "__main__":
    main()
