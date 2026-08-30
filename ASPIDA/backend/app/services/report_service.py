import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import Config
from app.models import Product, Return, ReturnAnalysis, Report, db
from app.services.analytics_service import AnalyticsService
from app.services.risk_service import RiskService
from app.services.recommendation_service import RecommendationService

class ReportService:
    @classmethod
    def generate_pdf_report(cls, user_id=None, title="Executive Return Intelligence & Prevention Report"):
        """
        Generates a professional PDF report using ReportLab with real database analytics.
        Saves file to reports folder and registers database entry.
        """
        os.makedirs(Config.REPORT_FOLDER, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ASPIDA_Report_{timestamp}.pdf"
        file_path = os.path.join(Config.REPORT_FOLDER, filename)

        # Retrieve Data
        summary = AnalyticsService.get_dashboard_summary()
        charts_data = AnalyticsService.get_dashboard_charts()
        product_risks = RiskService.get_all_product_risks()[:5]
        recommendations = RecommendationService.generate_recommendations()[:4]

        # Setup Document
        doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor("#0f172a"), spaceAfter=6)
        subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor("#64748b"), spaceAfter=15)
        h2_style = ParagraphStyle('Heading2', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor("#1e293b"), spaceBefore=12, spaceAfter=8)
        body_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
        bold_body = ParagraphStyle('BoldBodyText', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor("#0f172a"), fontName="Helvetica-Bold")

        story = []

        # Header
        story.append(Paragraph("<b>ASPIDA</b> - AI-Powered Return Intelligence & Prevention", title_style))
        story.append(Paragraph(f"Tagline: <i>'Understand Returns. Prevent Problems. Improve Products.'</i> | Generated: {datetime.now().strftime('%B %d, %Y %H:%M')}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3b82f6"), spaceAfter=15))

        # Executive Summary
        story.append(Paragraph("1. Executive Summary", h2_style))
        exec_text = (
            f"This management report presents synthesized return intelligence for product portfolio performance. "
            f"Across <b>{summary['total_orders']:,}</b> total orders, <b>{summary['total_returns']:,}</b> return requests "
            f"were processed resulting in an overall platform Return Rate of <b>{summary['return_rate']}%</b>. "
            f"The total estimated financial impact of returns is <b>₹{summary['estimated_return_cost']:,.2f}</b>, "
            f"with an estimated potential annual savings of <b>₹{summary['potential_savings']:,.2f}</b> achievable "
            f"through targeted root cause interventions."
        )
        story.append(Paragraph(exec_text, body_style))
        story.append(Spacer(1, 10))

        # Key Metrics Table
        story.append(Paragraph("2. Core Platform Performance Metrics", h2_style))
        kpi_data = [
            [Paragraph("Metric", bold_body), Paragraph("Value", bold_body), Paragraph("Benchmark / Status", bold_body)],
            [Paragraph("Total Orders", body_style), Paragraph(f"{summary['total_orders']:,}", body_style), Paragraph("Portfolio Baseline", body_style)],
            [Paragraph("Total Returns", body_style), Paragraph(f"{summary['total_returns']:,}", body_style), Paragraph(f"{summary['return_rate']}% Return Rate", body_style)],
            [Paragraph("High-Risk Products", body_style), Paragraph(f"{summary['high_risk_products']}", body_style), Paragraph("Requires Quality/Fit Intervention", body_style)],
            [Paragraph("Estimated Financial Impact", body_style), Paragraph(f"₹{summary['estimated_return_cost']:,.2f}", body_style), Paragraph("Refunds + Operational Costs", body_style)],
            [Paragraph("Targeted Potential Savings", body_style), Paragraph(f"₹{summary['potential_savings']:,.2f}", body_style), Paragraph("35% Avoidable Return Reduction", body_style)]
        ]
        kpi_table = Table(kpi_data, colWidths=[180, 150, 200])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 15))

        # High Risk Products Table
        story.append(Paragraph("3. High-Risk Product Profile", h2_style))
        risk_data = [
            [Paragraph("Product Name", bold_body), Paragraph("Category", bold_body), Paragraph("Risk Score", bold_body), Paragraph("Health Score", bold_body), Paragraph("Top Issue", bold_body)]
        ]
        for p in product_risks:
            risk_color = colors.HexColor("#ef4444") if p['risk_score'] >= 75 else (colors.HexColor("#f59e0b") if p['risk_score'] >= 50 else colors.HexColor("#10b981"))
            risk_data.append([
                Paragraph(p['product_name'], body_style),
                Paragraph(p['category'], body_style),
                Paragraph(f"<font color='{risk_color.hexval()}'><b>{p['risk_score']}/100 ({p['status']})</b></font>", body_style),
                Paragraph(f"{p['health_score']}/100", body_style),
                Paragraph(p['top_complaint'], body_style)
            ])
        
        risk_table = Table(risk_data, colWidths=[160, 100, 110, 80, 80])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 15))

        # Strategic AI Recommendations
        story.append(Paragraph("4. Strategic AI Recommendations", h2_style))
        rec_data = [
            [Paragraph("Priority", bold_body), Paragraph("Target Item / Category", bold_body), Paragraph("Actionable Recommendation", bold_body), Paragraph("Estimated Savings", bold_body)]
        ]
        for r in recommendations:
            rec_data.append([
                Paragraph(f"<b>{r['priority']}</b>", body_style),
                Paragraph(r['product_name'], body_style),
                Paragraph(r['recommendation'], body_style),
                Paragraph(f"₹{r['estimated_benefit']:,.2f}", body_style)
            ])

        rec_table = Table(rec_data, colWidths=[60, 120, 240, 110])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 15))

        # Footer Signoff
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=10))
        story.append(Paragraph("ASPIDA Intelligence Platform - Automated Report Generation Engine", subtitle_style))

        # Build Document
        doc.build(story)

        # Database Record
        report_record = Report(
            title=title,
            filename=filename,
            file_path=file_path,
            date_range="All Time",
            generated_by_id=user_id
        )
        db.session.add(report_record)
        db.session.commit()

        return report_record.to_dict()
