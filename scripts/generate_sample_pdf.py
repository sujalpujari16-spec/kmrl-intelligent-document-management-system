import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def create_kmrl_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor('#0d9488') # KMRL Teal
    dark_navy = colors.HexColor('#0f172a')
    text_muted = colors.HexColor('#475569')
    light_bg = colors.HexColor('#f0fdfa')
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=dark_navy,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        alignment=TA_CENTER
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_muted
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=dark_navy,
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        spaceAfter=4
    )

    elements = []

    # 1. Header Banner Table
    header_data = [
        [
            Paragraph("<b>KOCHI METRO RAIL LIMITED</b><br/><font color='#0d9488' size='9'><b>OPERATIONS & SAFETY DIVISION — MUTTOM OCC</b></font>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=dark_navy)),
            Paragraph("<b>REF:</b> KMRL/OPS/SOP/2026/042<br/><b>DATE:</b> 24 October 2026<br/><b>STATUS:</b> OFFICIAL DRAFT", ParagraphStyle('H2', fontName='Helvetica', fontSize=8.5, leading=12, textColor=text_muted, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 160])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(header_table)
    
    elements.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=4, spaceAfter=14))

    # 2. Document Title
    elements.append(Paragraph("STANDARD OPERATING PROCEDURE: MONSOON READINESS & ELEVATED VIADUCT SAFETY DIRECTIVE (2026–2027)", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Mandatory Compliance Guidelines for Train Operators, OCC Controllers & P-Way Engineers", subtitle_style))
    elements.append(Spacer(1, 14))

    # 3. Document Metadata Callout Card
    meta_card = [
        [
            Paragraph("<b>Document ID:</b> KMRL-SOP-2026-042", meta_style),
            Paragraph("<b>Security Level:</b> Restricted / Departmental", meta_style),
            Paragraph("<b>Revision:</b> 3.2 (Final)", meta_style)
        ],
        [
            Paragraph("<b>Issuing Authority:</b> Director of Rolling Stock", meta_style),
            Paragraph("<b>Corridor:</b> Aluva – Petta – SN Junction", meta_style),
            Paragraph("<b>Effective Date:</b> Immediate Effect", meta_style)
        ]
    ]
    meta_table = Table(meta_card, colWidths=[180, 180, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, primary_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#ccfbf1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # 4. Executive Summary
    elements.append(Paragraph("1. Executive Summary & Purpose", h2_style))
    elements.append(Paragraph(
        "In accordance with Kerala State Disaster Management Authority (KSDMA) seasonal advisories and the Metro Railways (Operation and Maintenance) Act, this directive establishes fail-safe protocols governing metro train operations, viaduct water drainage, automatic signaling attenuation, and 750V DC traction isolation across all 25 operational stations.",
        body_style
    ))

    # 5. Operational Velocity Caps
    elements.append(Paragraph("2. Severe Weather Speed Restrictions & Automatic Train Protection (ATP)", h2_style))
    elements.append(Paragraph("Train operators and automatic driving modes must dynamically adhere to the following precipitation thresholds:", body_style))
    
    speed_data = [
        ["Weather Condition", "Visibility Range", "Operating Mode", "Max Speed"],
        ["Normal / Light Showers", "> 500 meters", "Auto Mode (ATO)", "80 km/h"],
        ["Moderate Monsoon Rain", "200m – 500m", "Coded Manual (CM)", "60 km/h"],
        ["Heavy Downpour / Squall", "100m – 200m", "Restricted Manual (RM)", "45 km/h"],
        ["Severe Storm (Wind > 70 km/h)", "< 100 meters", "OCC Caution Order", "25 km/h"]
    ]
    speed_table = Table(speed_data, colWidths=[150, 120, 150, 100])
    speed_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    elements.append(speed_table)
    elements.append(Spacer(1, 10))

    # 6. Third Rail Traction & Track Safety
    elements.append(Paragraph("3. 750V DC Third Rail Traction & Drainage Integrity", h2_style))
    elements.append(Paragraph("• <b>Scupper Drain Inspections:</b> All viaduct downpipes and pier drainage basins between Kalamassery and Muttom depot must be inspected every 48 hours to prevent standing water.", bullet_style))
    elements.append(Paragraph("• <b>Third Rail Clearance:</b> If standing water reaches within 50mm of the bottom shroud of the 750V DC bottom-contact third rail conductor, OCC must immediately execute controlled traction isolation.", bullet_style))
    elements.append(Paragraph("• <b>ATC Balise Verification:</b> Post-flash flooding, signal engineers must execute transmission loopback tests on balise markers at turnaround sidings prior to passenger re-entry.", bullet_style))
    elements.append(Spacer(1, 8))

    # 7. Escalation & Emergency OCC Roster
    elements.append(Paragraph("4. Emergency Contact Matrix", h2_style))
    contact_data = [
        ["Department / Authority", "Designation", "Emergency Direct Line", "Radio Channel"],
        ["OCC Muttom Control Room", "Chief Train Controller", "+91 484 2846700", "Ch 01 (Primary)"],
        ["Permanent Way (P-Way)", "Executive Engineer", "+91 484 2846722", "Ch 04 (Civil)"],
        ["Traction Power Supply (TPS)", "Power Controller", "+91 484 2846744", "Ch 02 (Electrical)"],
        ["Disaster Management Unit", "Incident Commander", "1800 425 0355 (Toll Free)", "Ch 08 (Emergency)"]
    ]
    contact_table = Table(contact_data, colWidths=[140, 130, 150, 100])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_navy),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    elements.append(contact_table)
    elements.append(Spacer(1, 14))

    # 8. Sign-off & Audit Seal
    sign_data = [
        [
            Paragraph("<b>Drafted By:</b><br/>Tanisha S.<br/><font size='7.5' color='#64748b'>Senior Safety Inspector, KMRL</font>", ParagraphStyle('Sign1', fontName='Helvetica', fontSize=8.5, leading=12)),
            Paragraph("<b>Verified By:</b><br/>Gunjan R.<br/><font size='7.5' color='#64748b'>Head of Human Resources & Training</font>", ParagraphStyle('Sign2', fontName='Helvetica', fontSize=8.5, leading=12)),
            Paragraph("<b>Approved By:</b><br/>Sujal Pujari<br/><font size='7.5' color='#64748b'>Director of Rolling Stock & Operations</font>", ParagraphStyle('Sign3', fontName='Helvetica', fontSize=8.5, leading=12))
        ]
    ]
    sign_table = Table(sign_data, colWidths=[170, 170, 180])
    sign_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
    ]))
    elements.append(sign_table)
    
    doc.build(elements)
    print(f"Successfully generated: {filename}")

def create_kmrl_hr_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )
    styles = getSampleStyleSheet()
    primary_color = colors.HexColor('#0284c7') # KMRL Blue
    dark_navy = colors.HexColor('#0f172a')
    text_muted = colors.HexColor('#475569')
    light_bg = colors.HexColor('#f0f9ff')

    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=17, leading=21,
        textColor=dark_navy, alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=primary_color, alignment=TA_CENTER
    )
    meta_style = ParagraphStyle('DocMeta', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=text_muted)
    h2_style = ParagraphStyle('Heading2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=11.5, leading=15, textColor=dark_navy, spaceBefore=10, spaceAfter=5)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor('#1e293b'), alignment=TA_JUSTIFY, spaceAfter=6)
    bullet_style = ParagraphStyle('Bullet', parent=body_style, leftIndent=15, spaceAfter=4)

    elements = []
    header_data = [
        [
            Paragraph("<b>KOCHI METRO RAIL LIMITED</b><br/><font color='#0284c7' size='9'><b>HUMAN RESOURCES & EMPLOYEE WELFARE DIVISION</b></font>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=dark_navy)),
            Paragraph("<b>CIRCULAR NO:</b> KMRL/HR/BONUS/2026/019<br/><b>DATE:</b> 24 October 2026<br/><b>CATEGORY:</b> HR POLICY", ParagraphStyle('H2', fontName='Helvetica', fontSize=8.5, leading=12, textColor=text_muted, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[350, 170])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=4, spaceAfter=12))

    elements.append(Paragraph("POLICY CIRCULAR: ANNUAL PERFORMANCE LINKED INCENTIVE (PLI) & DIWALI FESTIVAL BONUS — FY 2025–26", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Applicable to All Regular Employees, Station Controllers, Maintenance Technicians & Executive Cadres", subtitle_style))
    elements.append(Spacer(1, 10))

    meta_card = [
        [
            Paragraph("<b>Sanction Ref:</b> KMRL-MD-RES-2026-88", meta_style),
            Paragraph("<b>Eligibility Cutoff:</b> 31 March 2026", meta_style),
            Paragraph("<b>Disbursement Date:</b> 28 October 2026", meta_style)
        ]
    ]
    meta_table = Table(meta_card, colWidths=[180, 180, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, primary_color),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("1. Scope & Objective", h2_style))
    elements.append(Paragraph(
        "Kochi Metro Rail Limited (KMRL) is pleased to announce the disbursement schedule and qualifying criteria for the Annual Performance-Linked Incentive (PLI) and Festival Ex-Gratia for the fiscal year 2025–26, approved in the 68th Board of Directors session.",
        body_style
    ))

    elements.append(Paragraph("2. Incentive Structure & Payout Bands", h2_style))
    bonus_data = [
        ["Cadre / Level", "Annual Rating Threshold", "Basic Multiplier", "Ex-Gratia Amount"],
        ["Executive (E1 - E6)", "Score >= 4.2 / 5.0 (Exceeds)", "1.5x Basic Pay", "Rs. 25,000 (Fixed Cap)"],
        ["Supervisors (S1 - S3)", "Score >= 3.8 / 5.0 (Commendable)", "1.75x Basic Pay", "Rs. 22,500 (Fixed Cap)"],
        ["Non-Executive / Operators", "Satisfactory Attendance (> 92%)", "2.0x Basic Pay", "Rs. 20,000 (Flat Bonus)"],
        ["Contracted Auxiliary Staff", "Active tenure > 180 days", "N/A", "Rs. 7,500 (Festival Gift)"]
    ]
    bonus_table = Table(bonus_data, colWidths=[140, 160, 110, 110])
    bonus_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    elements.append(bonus_table)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("3. Claim Process & Verification", h2_style))
    elements.append(Paragraph("• <b>Automated Payroll Credit:</b> Eligible employees will receive credit directly in their registered State Bank of India (SBI) salary accounts alongside the October 2026 payroll run.", bullet_style))
    elements.append(Paragraph("• <b>Appraisal Grievances:</b> Any rating dispute must be logged via the KMRL IDMS Employee Portal before 26 October 2026, 17:00 IST.", bullet_style))
    elements.append(Spacer(1, 12))

    sign_data = [
        [
            Paragraph("<b>Issued By:</b><br/>Gunjan R.<br/><font size='7.5' color='#64748b'>General Manager (Human Resources)</font>", ParagraphStyle('S1', fontName='Helvetica', fontSize=8.5, leading=12)),
            Paragraph("<b>Financial Concurrence:</b><br/>Finance & Accounts Cell<br/><font size='7.5' color='#64748b'>KMRL Corporate HQ, Ernakulam</font>", ParagraphStyle('S2', fontName='Helvetica', fontSize=8.5, leading=12)),
            Paragraph("<b>By Order of:</b><br/>Managing Director<br/><font size='7.5' color='#64748b'>Kochi Metro Rail Limited</font>", ParagraphStyle('S3', fontName='Helvetica', fontSize=8.5, leading=12))
        ]
    ]
    sign_table = Table(sign_data, colWidths=[170, 170, 180])
    sign_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
    ]))
    elements.append(sign_table)

    doc.build(elements)
    print(f"Successfully generated: {filename}")

if __name__ == '__main__':
    target_dir = os.path.join(os.getcwd(), 'sample_documents')
    os.makedirs(target_dir, exist_ok=True)
    
    # 1. Operations SOP
    sop_path = os.path.join(target_dir, 'KMRL_Monsoon_Safety_Directives_2026.pdf')
    create_kmrl_pdf(sop_path)
    
    # 2. HR Circular
    hr_path = os.path.join(target_dir, 'KMRL_HR_Circular_Annual_Performance_Bonus_2026.pdf')
    create_kmrl_hr_pdf(hr_path)

    # Also place on Desktop for direct drag-and-drop convenience
    desktop_sop = os.path.expanduser('~/Desktop/KMRL_Monsoon_Safety_Directives_2026.pdf')
    desktop_hr = os.path.expanduser('~/Desktop/KMRL_HR_Circular_Annual_Performance_Bonus_2026.pdf')
    try:
        create_kmrl_pdf(desktop_sop)
        create_kmrl_hr_pdf(desktop_hr)
        print("Desktop copies created successfully.")
    except Exception as e:
        print(f"Desktop copy optional: {e}")

