import os
import sys
import random
from datetime import datetime, timedelta

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models import User, Product, Return, ReturnAnalysis, Alert, Recommendation, AIInsight, Setting
from app.ml.train_models import train_and_save_models
from app.services.nlp_service import NLPService
from app.services.sentiment_service import SentimentService

CATEGORIES = ['Electronics', 'Clothing', 'Footwear', 'Home Appliances', 'Beauty', 'Accessories']

PRODUCT_TEMPLATES = [
    # Footwear
    ("UltraBoost Running Shoes X", "Footwear", 4999.0, "High-performance cushioned running shoes.", 1200),
    ("Classic Leather Sneakers", "Footwear", 3499.0, "Retro styled leather casual sneakers.", 950),
    ("Air Pro Athletic Trainers", "Footwear", 5999.0, "Lightweight breathable gym training shoes.", 1400),
    ("Waterproof Hiking Boots", "Footwear", 6800.0, "Durable outdoor mountain climbing boots.", 800),
    ("Formal Leather Loafers", "Footwear", 4200.0, "Handcrafted Italian leather slip-on shoes.", 650),
    ("Canvas Casual Slip-Ons", "Footwear", 1800.0, "Flexible everyday canvas shoes.", 1100),
    ("Trail Running Shoes Pro", "Footwear", 5400.0, "All-terrain rugged grip trail shoes.", 900),
    ("Women's High Heel Sandals", "Footwear", 3200.0, "Elegant evening party wear heel sandals.", 750),
    ("OrthoComfort Walking Shoes", "Footwear", 2999.0, "Ergonomic memory foam arch support shoes.", 1600),

    # Clothing
    ("Slim Fit Denim Jeans", "Clothing", 2499.0, "Stretchable dark indigo denim jeans.", 1500),
    ("100% Organic Cotton T-Shirt", "Clothing", 899.0, "Soft breathable crewneck basic tee.", 3200),
    ("Waterproof Winter Parka", "Clothing", 7499.0, "Insulated thermal heavy jacket.", 600),
    ("Formal Oxford Dress Shirt", "Clothing", 1999.0, "Wrinkle-resistant tailored cotton shirt.", 1800),
    ("Fleece Hooded Sweatshirt", "Clothing", 2200.0, "Cozy heavyweight pullover hoodie.", 2100),
    ("Athletic Performance Leggings", "Clothing", 1699.0, "High-waist squat-proof gym tights.", 2400),
    ("Linen Casual Summer Blazer", "Clothing", 4500.0, "Lightweight breathable smart blazer.", 500),
    ("Seamless Sports Bra", "Clothing", 1299.0, "Medium support moisture-wicking bra.", 1900),

    # Electronics
    ("Noise-Canceling Wireless Earbuds X", "Electronics", 3999.0, "True wireless earbuds with ANC.", 2500),
    ("Smartwatch Fitness Tracker Pro", "Electronics", 4999.0, "AMOLED heart rate & SPO2 tracking watch.", 1800),
    ("Portable Bluetooth Speaker HD", "Electronics", 2999.0, "20W stereo bass waterproof speaker.", 2200),
    ("4K Ultra HD Action Camera", "Electronics", 8999.0, "Wide-angle dual screen waterproof camera.", 700),
    ("Mechanical Gaming Keyboard RGB", "Electronics", 3499.0, "Tactile blue switch back-lit keyboard.", 1300),
    ("Ergonomic Wireless Mouse", "Electronics", 1499.0, "Multi-device precision optical mouse.", 2800),
    ("Over-Ear Studio Headphones", "Electronics", 6499.0, "Hi-Res audio monitor headphones.", 950),
    ("Fast Charging Power Bank 20000mAh", "Electronics", 1999.0, "65W USB-C PD fast charge battery.", 3100),
    ("HD Webcam 1080p with Mic", "Electronics", 2499.0, "Auto-focus streaming webcam.", 1400),

    # Home Appliances
    ("Robotic Vacuum Cleaner Pro", "Home Appliances", 18999.0, "Smart LiDAR navigation auto-empty vacuum.", 450),
    ("Air Fryer XXL 5.5L", "Home Appliances", 6999.0, "Digital touch rapid-air frying appliance.", 1600),
    ("Electric Espresso Coffee Machine", "Home Appliances", 12499.0, "15-bar Italian pump espresso maker.", 620),
    ("HEPA Air Purifier 400", "Home Appliances", 9999.0, "3-stage filtration quiet air purifier.", 850),
    ("Smart Electric Kettle 1.7L", "Home Appliances", 2499.0, "Temperature control stainless steel kettle.", 1900),
    ("Compact Countertop Microwave", "Home Appliances", 7999.0, "700W 20L convection microwave oven.", 750),
    ("Handheld Garment Steamer", "Home Appliances", 2100.0, "Continuous steam wrinkle remover.", 1400),
    ("High-Speed Blender 1200W", "Home Appliances", 4499.0, "Multi-blade smoothie processor.", 1100),

    # Beauty
    ("Hydrating Hyaluronic Acid Serum", "Beauty", 1199.0, "Plumping anti-aging skin serum 30ml.", 4200),
    ("Vitamin C Brightening Facial Wash", "Beauty", 699.0, "Gentle foaming deep cleanser.", 3800),
    ("Professional Ionic Hair Dryer", "Beauty", 2999.0, "1800W fast drying salon blow dryer.", 1600),
    ("Ceramic Hair Straightener Brush", "Beauty", 2200.0, "Anti-scald temperature control brush.", 1200),
    ("Organic Argan Oil Hair Treatment", "Beauty", 899.0, "Restorative leave-in shine oil.", 2900),
    ("Matte Longwear Liquid Lipstick", "Beauty", 799.0, "Smudge-proof 16h lipstick set.", 5100),
    ("Sunscreen Gel SPF 50 PA++++", "Beauty", 599.0, "Non-greasy zero white-cast sunscreen.", 6000),

    # Accessories
    ("Genuine Leather Travel Duffle Bag", "Accessories", 5499.0, "Weekend duffle bag with shoe compartment.", 850),
    ("Polarized UV400 Sunglasses", "Accessories", 1499.0, "Classic aviator style metal frame glasses.", 2300),
    ("Anti-Theft Laptop Backpack 15.6\"", "Accessories", 2299.0, "Water-resistant USB charging backpack.", 3400),
    ("RFID Blocking Leather Wallet", "Accessories", 1299.0, "Bi-fold genuine leather slim wallet.", 2700),
    ("Stainless Steel Vacuum Insulated Bottle", "Accessories", 999.0, "24h cold 12h hot 750ml flask.", 4100),
    ("Automatic Open Compact Umbrella", "Accessories", 849.0, "Windproof 10-rib travel umbrella.", 1900)
]

COMMENT_BANK = {
    "Size Issue": [
        "The shoe is smaller than expected and uncomfortable.",
        "Runs very small, I ordered size 9 but fits like size 8.",
        "Too big, fits loosely around waist and shoulders.",
        "The chest size doesn't match the size chart provided on website.",
        "Tight around hips, smaller than standard Large size.",
        "Sleeves are too short and overall fit is too tight across chest.",
        "Way larger than indicated on the product page sizing guide.",
        "Sizing is totally inaccurate. Need to exchange for bigger size."
    ],
    "Quality Issue": [
        "Stitching came apart after wearing it just twice.",
        "Poor material quality, fabric feels cheap and thin.",
        "Zipper broke on the very first day of light usage.",
        "Item stopped working after 3 days. Terrible build quality.",
        "Buttons fell off right out of the package.",
        "Sole detached from shoe after single workout session.",
        "Screen flickers constantly and audio stutters. Defective unit.",
        "Battery drains completely within 30 minutes of full charge."
    ],
    "Damaged Product": [
        "Package arrived completely crushed and box torn open.",
        "Screen is cracked right out of the sealed box.",
        "Item scratched all over and dented during transit.",
        "Glass container smashed into pieces inside shipment box.",
        "Water damage on product box and electronic unit damaged.",
        "Chipped wood corner on furniture piece during shipping.",
        "Broken plastic handle inside cracked packaging."
    ],
    "Wrong Product": [
        "Received a completely different item than what I ordered.",
        "Sent me men's shoes instead of women's boots.",
        "Received 64GB version instead of 256GB version ordered.",
        "Order says wireless earbuds but got wired earphones.",
        "Totally wrong model number shipped in package."
    ],
    "Wrong Color": [
        "Ordered blue jacket but received bright red one.",
        "Color in picture is beige but physical item is dark brown.",
        "Ordered silver metal watch, received gold shade.",
        "Shade of grey is much darker than online photos shown."
    ],
    "Product Not as Described": [
        "Listing says genuine leather but it is cheap synthetic plastic.",
        "Specifications advertised 10 hour battery life, lasts only 2 hours.",
        "Features mentioned in description are completely missing.",
        "Product photo showed accessories included, none came in box.",
        "Advertised as waterproof but water got inside immediately."
    ],
    "Missing Item": [
        "Missing power cable and user manual from sealed package.",
        "Only 1 piece delivered instead of 2 pack listed.",
        "Screws and mounting hardware missing from box."
    ],
    "Delivery Issue": [
        "Delivered 2 weeks late after scheduled delivery date.",
        "Package left outside in rain by courier driver.",
        "Delivery took way too long, missed birthday deadline."
    ],
    "Customer Changed Mind": [
        "Don't need this item anymore, found alternative option.",
        "Bought by mistake during impulse flash sale.",
        "Decided to keep old appliance instead of replacing."
    ]
}

def seed(reset_db=True):
    app = create_app()
    with app.app_context():
        os.makedirs(os.path.join(app.root_path, '..', 'instance'), exist_ok=True)
        if reset_db:
            print("[Seed] Creating/Verifying database tables...")
            db.create_all()

        # 1. Train ML models first
        print("[Seed] Training ML Reason and Sentiment Models...")
        train_and_save_models()

        # 2. Seed Users
        print("[Seed] Creating/Updating Demo Users...")
        demo_users_data = [
            {"name": "ASPIDA Admin", "email": "admin@aspida.com", "password": "admin123", "role": "admin"},
            {"name": "ASPIDA Manager", "email": "manager@aspida.com", "password": "manager123", "role": "manager"},
            {"name": "ASPIDA Analyst", "email": "analyst@aspida.com", "password": "analyst123", "role": "analyst"}
        ]

        for udata in demo_users_data:
            email_norm = udata["email"].strip().lower()
            existing = User.query.filter_by(email=email_norm).first()
            if not existing:
                u = User(
                    name=udata["name"],
                    email=email_norm,
                    role=udata["role"],
                    is_active=True
                )
                u.set_password(udata["password"])
                db.session.add(u)
                print(f"[Seed] Created demo user: {email_norm}")
            else:
                existing.name = udata["name"]
                existing.role = udata["role"]
                existing.is_active = True
                existing.set_password(udata["password"])
                print(f"[Seed] Updated demo user: {email_norm}")

        db.session.commit()

        # 3. Seed Products (50+ products) if missing
        if Product.query.count() == 0:
            print("[Seed] Creating 50+ Product Records...")
            products = []
            for idx, (name, cat, price, desc, orders) in enumerate(PRODUCT_TEMPLATES, 1):
                sku = f"SKU-{cat[:3].upper()}-{1000+idx}"
                p = Product(
                    name=name,
                    sku=sku,
                    category=cat,
                    price=price,
                    description=desc,
                    total_orders=orders,
                    target_return_threshold=10.0
                )
                products.append(p)

            db.session.add_all(products)
            db.session.commit()
        else:
            print("[Seed] Products already exist in database.")
            products = Product.query.all()

        # 4. Seed Returns if missing
        if Return.query.count() == 0:
            print("[Seed] Generating 500+ Return Records with AI Analyses...")
        
        # Designate specific products for high return rate anomalies
        # Product #1 (UltraBoost Running Shoes X): High Size Issues (Return rate ~27%)
        # Product #17 (Noise-Canceling Earbuds X): High Quality Issues (Return rate ~24%)
        # Product #26 (Robotic Vacuum Cleaner Pro): High Damaged Product Issues (Return rate ~19%)
        
        returns_to_add = []
        now = datetime.now()

        for p in products:
            # Determine return count based on product profile
            if "UltraBoost" in p.name:
                num_returns = 48  # High return count (~27% of 1200 orders)
                dominant_reason = "Size Issue"
            elif "Earbuds" in p.name:
                num_returns = 42  # High return count (~24% of 2500 orders)
                dominant_reason = "Quality Issue"
            elif "Vacuum" in p.name:
                num_returns = 28  # High return count (~19% of 450 orders)
                dominant_reason = "Damaged Product"
            elif "Jeans" in p.name or "Leggings" in p.name or "Heel" in p.name:
                num_returns = random.randint(18, 30)
                dominant_reason = "Size Issue"
            elif "Camera" in p.name or "Mixer" in p.name or "Purifier" in p.name:
                num_returns = random.randint(12, 22)
                dominant_reason = "Product Not as Described"
            else:
                num_returns = random.randint(3, 10)
                dominant_reason = random.choice(list(COMMENT_BANK.keys()))

            for _ in range(num_returns):
                # 70% chance of dominant reason, 30% random
                chosen_reason = dominant_reason if random.random() < 0.70 else random.choice(list(COMMENT_BANK.keys()))
                comment = random.choice(COMMENT_BANK[chosen_reason])
                
                days_ago = random.randint(1, 120)
                r_date = (now - timedelta(days=days_ago)).date()
                p_date = (r_date - timedelta(days=random.randint(5, 20)))

                ret = Return(
                    product_id=p.id,
                    customer_comment=comment,
                    return_reason=chosen_reason,
                    purchase_date=p_date,
                    return_date=r_date,
                    purchase_price=p.price,
                    status='Processed'
                )
                returns_to_add.append(ret)

        db.session.add_all(returns_to_add)
        db.session.commit()

        # 5. Process Return Analysis for each return record using NLP & Sentiment services
        print("[Seed] Running NLP & Sentiment Analysis on generated return records...")
        analyses_to_add = []
        for r in returns_to_add:
            nlp_res = NLPService.classify_return_reason(r.customer_comment, user_selected_reason=r.return_reason)
            sent_res = SentimentService.analyze_sentiment(r.customer_comment)

            ana = ReturnAnalysis(
                return_id=r.id,
                primary_reason=nlp_res['primary_reason'],
                secondary_reason=nlp_res['secondary_reason'],
                sentiment=sent_res['sentiment'],
                sentiment_score=sent_res['sentiment_score'],
                root_cause=nlp_res['root_cause'],
                urgency=nlp_res['urgency'],
                confidence=nlp_res['confidence'],
                recommendation=nlp_res['explanation'],
                damage_assessment='No obvious damage' if nlp_res['primary_reason'] != 'Damaged Product' else 'Visible damage/defect',
                damage_score=15.0 if nlp_res['primary_reason'] != 'Damaged Product' else 75.0
            )
            analyses_to_add.append(ana)

        db.session.add_all(analyses_to_add)
        db.session.commit()

        # 6. Seed System Alerts if missing
        if Alert.query.count() == 0:
            print("[Seed] Creating System Early Warning Alerts...")
            alerts = [
                Alert(
                    title="Critical Return Rate Spike: UltraBoost Running Shoes X",
                    description="Size-related return complaints surged 240% over the last 30 days. Current return rate is 27.2% vs target 10.0%.",
                    severity="Critical",
                    product_id=products[0].id if products else None,
                    status="unread"
                ),
                Alert(
                    title="Battery Quality Anomaly: Noise-Canceling Wireless Earbuds X",
                    description="Battery drainage and build quality complaints increased 180%. Negative sentiment reached 61%.",
                    severity="Critical",
                    product_id=products[17].id if len(products) > 17 else None,
                    status="unread"
                ),
                Alert(
                    title="Transit Packaging Damage Warning: Robotic Vacuum Cleaner Pro",
                    description="Packaging damage reports increased 120% during courier transit for high-value home appliances.",
                    severity="Warning",
                    product_id=products[26].id if len(products) > 26 else None,
                    status="unread"
                ),
                Alert(
                    title="Category Trend: Footwear Sizing Inconsistency",
                    description="Footwear category returns are 2.4x higher than platform average due to inconsistent size chart specifications.",
                    severity="Warning",
                    product_id=None,
                    status="read"
                )
            ]
            db.session.add_all(alerts)

        # 7. Seed AI Insights if missing
        if AIInsight.query.count() == 0:
            print("[Seed] Creating AI Pattern Insights...")
            insights = [
                AIInsight(
                    title="Footwear Sizing Anomaly",
                    description="Size-related complaints account for 34% of all footwear returns, significantly exceeding the platform average of 18%.",
                    severity="High",
                    evidence="Analysis of 120+ footwear comments indicates 'smaller than expected' as the dominant customer phrasing.",
                    category="Footwear",
                    affected_products_json='["UltraBoost Running Shoes X", "Classic Leather Sneakers", "Formal Leather Loafers"]'
                ),
                AIInsight(
                    title="Packaging Durability Vulnerability",
                    description="In-transit damage reports surged 34% for fragile electronics and home appliances during peak logistics period.",
                    severity="Critical",
                    evidence="OpenCV visual damage analysis confirmed box crushing and edge impacts on 68% of uploaded return photos.",
                    category="Home Appliances",
                    affected_products_json='["Robotic Vacuum Cleaner Pro", "Air Fryer XXL 5.5L"]'
                ),
                AIInsight(
                    title="Battery Performance Expectation Mismatch",
                    description="Electronics items show a 42% surge in 'Product Not as Described' due to advertised vs actual battery duration.",
                    severity="Medium",
                    evidence="Customer comments report average battery runtime of 3.5 hours compared to 10 hours specified on product pages.",
                    category="Electronics",
                    affected_products_json='["Noise-Canceling Wireless Earbuds X", "4K Ultra HD Action Camera"]'
                )
            ]
            db.session.add_all(insights)

        # 8. Seed Settings if missing
        if Setting.query.count() == 0:
            print("[Seed] Creating Platform Settings...")
            settings = [
                Setting(key="handling_cost_per_return", value="250.0", description="Operational & shipping cost overhead per return (INR)"),
                Setting(key="default_currency", value="INR", description="Default platform currency code"),
                Setting(key="target_return_rate_threshold", value="10.0", description="Maximum benchmark return rate %")
            ]
            db.session.add_all(settings)

        db.session.commit()
        print("\n==================================================")
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("Users: admin@aspida.com (admin123), manager@aspida.com (manager123), analyst@aspida.com (analyst123)")
        print(f"Total Users: {User.query.count()}")
        print(f"Total Products: {Product.query.count()}")
        print(f"Total Returns: {Return.query.count()}")
        print("==================================================\n")

if __name__ == '__main__':
    seed()

