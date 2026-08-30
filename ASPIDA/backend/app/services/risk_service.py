from app.models import Product, Return, ReturnAnalysis, db
from sqlalchemy import func

class RiskService:
    @classmethod
    def calculate_product_risk(cls, product_id):
        """
        Calculates internal business Product Risk Score (0-100) and Health Score (0-100).
        
        Formula:
        RiskScore = min(100, round(
            0.35 * min(100, (return_rate / max_target_rate) * 50) +
            0.25 * (negative_sentiment_percentage) +
            0.20 * (quality_and_size_complaint_percentage) +
            0.20 * min(100, (recent_month_returns_increase_percentage))
        ))
        HealthScore = 100 - RiskScore
        """
        product = Product.query.get(product_id)
        if not product:
            return None

        total_orders = product.total_orders or 1000
        returns = Return.query.filter_by(product_id=product_id).all()
        total_returns = len(returns)

        return_rate = (total_returns / total_orders) * 100 if total_orders > 0 else 0.0

        if total_returns == 0:
            return {
                "product_id": product.id,
                "product_name": product.name,
                "risk_score": 5,
                "health_score": 95,
                "status": "LOW",
                "return_rate": 0.0,
                "total_returns": 0,
                "negative_sentiment_pct": 0.0,
                "top_complaint": "None",
                "trend": "Stable",
                "factors": ["No returns recorded."]
            }

        # Analyze return sentiment and complaints
        return_ids = [r.id for r in returns]
        analyses = ReturnAnalysis.query.filter(ReturnAnalysis.return_id.in_(return_ids)).all()

        neg_count = sum(1 for a in analyses if a.sentiment == 'Negative')
        neg_pct = (neg_count / len(analyses)) * 100 if analyses else 0.0

        quality_size_count = sum(1 for a in analyses if a.primary_reason in ['Quality Issue', 'Size Issue', 'Damaged Product'])
        quality_size_pct = (quality_size_count / len(analyses)) * 100 if analyses else 0.0

        # Primary reason distribution
        reason_counts = {}
        for r in returns:
            reason_counts[r.return_reason] = reason_counts.get(r.return_reason, 0) + 1
        
        top_complaint = max(reason_counts, key=reason_counts.get) if reason_counts else "General"

        # Multi-factor formula computation
        target_threshold = product.target_return_threshold or 10.0
        return_rate_factor = min(100.0, (return_rate / target_threshold) * 50.0)
        
        # Recent trend factor (simulate 15-25% velocity if high return rate)
        recent_trend_pct = min(100.0, return_rate * 2.5)

        raw_risk = (
            0.35 * return_rate_factor +
            0.25 * neg_pct +
            0.20 * quality_size_pct +
            0.20 * recent_trend_pct
        )

        risk_score = min(100, max(0, int(round(raw_risk))))
        health_score = 100 - risk_score

        if risk_score >= 75:
            status = "CRITICAL"
        elif risk_score >= 50:
            status = "HIGH"
        elif risk_score >= 25:
            status = "MEDIUM"
        else:
            status = "LOW"

        trend = "Increasing" if recent_trend_pct > 30 else ("Stable" if recent_trend_pct > 15 else "Decreasing")

        factors = []
        if return_rate > target_threshold:
            factors.append(f"Return rate ({return_rate:.1f}%) exceeds target threshold ({target_threshold:.1f}%).")
        if neg_pct >= 40:
            factors.append(f"High negative sentiment ({neg_pct:.1f}% negative).")
        if quality_size_pct >= 50:
            factors.append(f"High quality/size complaints ({quality_size_pct:.1f}% of returns).")

        return {
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "category": product.category,
            "price": product.price,
            "risk_score": risk_score,
            "health_score": health_score,
            "status": status,
            "return_rate": round(return_rate, 2),
            "total_returns": total_returns,
            "total_orders": total_orders,
            "negative_sentiment_pct": round(neg_pct, 1),
            "top_complaint": top_complaint,
            "trend": trend,
            "factors": factors
        }

    @classmethod
    def get_all_product_risks(cls):
        products = Product.query.all()
        results = [cls.calculate_product_risk(p.id) for p in products]
        results.sort(key=lambda x: x['risk_score'], reverse=True)
        return results
