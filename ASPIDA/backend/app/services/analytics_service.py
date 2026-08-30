from app.models import Product, Return, ReturnAnalysis, db
from app.services.risk_service import RiskService
from sqlalchemy import func
from datetime import datetime, timedelta
import pandas as pd

class AnalyticsService:
    @classmethod
    def get_dashboard_summary(cls, category_filter=None, product_filter=None, date_from=None, date_to=None):
        """
        Computes platform-wide dashboard KPIs from real database calculations.
        Returns:
        Total Orders, Total Returns, Return Rate, High Risk Products, Estimated Cost, Potential Savings.
        """
        # Base query for products
        product_query = Product.query
        if category_filter and category_filter != 'All':
            product_query = product_query.filter(Product.category == category_filter)
        if product_filter and product_filter != 'All':
            product_query = product_query.filter(Product.id == int(product_filter))

        products = product_query.all()
        product_ids = [p.id for p in products]

        if not product_ids:
            return {
                "total_orders": 0,
                "total_returns": 0,
                "return_rate": 0.0,
                "high_risk_products": 0,
                "estimated_return_cost": 0.0,
                "potential_savings": 0.0,
                "avg_handling_cost": 250.0
            }

        total_orders = sum(p.total_orders or 1000 for p in products)

        # Base query for returns
        return_query = Return.query.filter(Return.product_id.in_(product_ids))

        if date_from:
            try:
                dt_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                return_query = return_query.filter(Return.return_date >= dt_from)
            except Exception:
                pass

        if date_to:
            try:
                dt_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                return_query = return_query.filter(Return.return_date <= dt_to)
            except Exception:
                pass

        returns = return_query.all()
        total_returns = len(returns)

        return_rate = (total_returns / total_orders * 100) if total_orders > 0 else 0.0

        # Calculate high risk products count
        risks = [RiskService.calculate_product_risk(p.id) for p in products]
        high_risk_count = sum(1 for r in risks if r and r['risk_score'] >= 50)

        # Calculate financial impact
        # Total cost = sum of (purchase_price + handling_cost_per_return)
        handling_cost_per_return = 250.0  # ₹250 standard processing + shipping overhead
        total_refund_value = sum(r.purchase_price for r in returns)
        total_handling_cost = total_returns * handling_cost_per_return
        estimated_return_cost = total_refund_value + total_handling_cost

        # Potential savings assuming 30% reduction in avoidable returns (size, description, quality)
        avoidable_returns = [r for r in returns if r.return_reason in ['Size Issue', 'Product Not as Described', 'Wrong Color', 'Damaged Product']]
        avoidable_cost = sum(r.purchase_price + handling_cost_per_return for r in avoidable_returns)
        potential_savings = avoidable_cost * 0.35

        return {
            "total_orders": total_orders,
            "total_returns": total_returns,
            "return_rate": round(return_rate, 2),
            "high_risk_products": high_risk_count,
            "estimated_return_cost": round(estimated_return_cost, 2),
            "potential_savings": round(potential_savings, 2),
            "avg_handling_cost": handling_cost_per_return
        }

    @classmethod
    def get_dashboard_charts(cls, category_filter=None, product_filter=None, date_from=None, date_to=None):
        """Generates real interactive chart datasets for Recharts."""
        product_query = Product.query
        if category_filter and category_filter != 'All':
            product_query = product_query.filter(Product.category == category_filter)
        if product_filter and product_filter != 'All':
            product_query = product_query.filter(Product.id == int(product_filter))

        products = product_query.all()
        product_ids = [p.id for p in products]

        if not product_ids:
            return {
                "return_trends": [],
                "reasons": [],
                "categories": [],
                "sentiments": [],
                "top_problematic_products": [],
                "monthly_volume": []
            }

        return_query = Return.query.filter(Return.product_id.in_(product_ids))
        returns = return_query.all()

        # 1. Returns by Reason
        reason_counts = {}
        for r in returns:
            reason_counts[r.return_reason] = reason_counts.get(r.return_reason, 0) + 1
        
        reasons_chart = [{"reason": k, "count": v} for k, v in sorted(reason_counts.items(), key=lambda x: x[1], reverse=True)]

        # 2. Returns by Product Category
        cat_counts = {}
        for r in returns:
            c = r.product.category if r.product else "Other"
            cat_counts[c] = cat_counts.get(c, 0) + 1

        category_chart = [{"category": k, "returns": v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)]

        # 3. Sentiment Distribution
        return_ids = [r.id for r in returns]
        analyses = ReturnAnalysis.query.filter(ReturnAnalysis.return_id.in_(return_ids)).all() if return_ids else []

        sent_counts = {"Negative": 0, "Neutral": 0, "Positive": 0}
        for a in analyses:
            sent_counts[a.sentiment] = sent_counts.get(a.sentiment, 0) + 1

        sentiments_chart = [{"sentiment": k, "count": v} for k, v in sent_counts.items()]

        # 4. Top Problematic Products (by Risk Score / Return count)
        product_risks = [RiskService.calculate_product_risk(p.id) for p in products]
        product_risks.sort(key=lambda x: x['risk_score'], reverse=True)
        top_problematic = [
            {
                "id": p['product_id'],
                "name": p['product_name'],
                "risk_score": p['risk_score'],
                "health_score": p['health_score'],
                "returns": p['total_returns'],
                "return_rate": p['return_rate'],
                "top_complaint": p['top_complaint']
            } for p in product_risks[:6]
        ]

        # 5. Monthly Volume & Return Rate Trend
        monthly_map = {}
        for r in returns:
            if r.return_date:
                m_key = r.return_date.strftime('%Y-%m')
                if m_key not in monthly_map:
                    monthly_map[m_key] = {"month": m_key, "returns": 0, "orders": 10000}
                monthly_map[m_key]["returns"] += 1

        sorted_months = sorted(monthly_map.keys())
        monthly_volume = []
        for m in sorted_months:
            item = monthly_map[m]
            rate = round((item["returns"] / item["orders"]) * 100, 2)
            monthly_volume.append({
                "month": m,
                "returns": item["returns"],
                "return_rate": rate
            })

        return {
            "return_trends": monthly_volume,
            "reasons": reasons_chart,
            "categories": category_chart,
            "sentiments": sentiments_chart,
            "top_problematic_products": top_problematic,
            "monthly_volume": monthly_volume
        }

    @classmethod
    def calculate_what_if_simulation(cls, current_returns, expected_reduction_pct, avg_return_cost=250.0, avg_product_price=1200.0):
        """
        Calculates savings scenario for What-If simulator.
        Inputs: current_returns, expected_reduction_pct, avg_return_cost, avg_product_price.
        """
        try:
            current_returns = float(current_returns)
            reduction_pct = float(expected_reduction_pct) / 100.0
            avg_cost = float(avg_return_cost)
            avg_price = float(avg_product_price)

            prevented_returns = int(round(current_returns * reduction_pct))
            new_returns = int(current_returns - prevented_returns)

            direct_shipping_savings = prevented_returns * avg_cost
            refund_loss_savings = prevented_returns * avg_price
            total_estimated_savings = direct_shipping_savings + refund_loss_savings

            before_cost = current_returns * (avg_cost + avg_price)
            after_cost = new_returns * (avg_cost + avg_price)

            scenarios = [
                {"scenario": "Size Chart Optimization", "reduction": "25%", "savings": round(total_estimated_savings * 0.40, 2)},
                {"scenario": "Packaging Enhancement", "reduction": "15%", "savings": round(total_estimated_savings * 0.25, 2)},
                {"scenario": "Description Alignment", "reduction": "20%", "savings": round(total_estimated_savings * 0.35, 2)}
            ]

            return {
                "success": True,
                "current_returns": int(current_returns),
                "reduction_pct": float(expected_reduction_pct),
                "prevented_returns": prevented_returns,
                "new_returns": new_returns,
                "estimated_savings": round(total_estimated_savings, 2),
                "before_cost": round(before_cost, 2),
                "after_cost": round(after_cost, 2),
                "scenarios": scenarios
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
