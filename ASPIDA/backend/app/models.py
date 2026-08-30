from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(30), default='analyst')  # admin, manager, analyst
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reports = db.relationship('Report', backref='generated_by', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    sku = db.Column(db.String(80), unique=True, nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    total_orders = db.Column(db.Integer, default=1000)
    target_return_threshold = db.Column(db.Float, default=10.0) # threshold %
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    returns = db.relationship('Return', backref='product', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='product', lazy=True, cascade='all, delete-orphan')
    recommendations = db.relationship('Recommendation', backref='product', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'category': self.category,
            'price': self.price,
            'description': self.description,
            'total_orders': self.total_orders,
            'target_return_threshold': self.target_return_threshold,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Return(db.Model):
    __tablename__ = 'returns'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    customer_comment = db.Column(db.Text, nullable=False)
    return_reason = db.Column(db.String(100), nullable=False, index=True) # User submitted reason or initial class
    purchase_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='Processed') # Pending, Processed, Closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    analysis = db.relationship('ReturnAnalysis', backref='return_record', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else 'Unknown Product',
            'product_sku': self.product.sku if self.product else '',
            'category': self.product.category if self.product else 'General',
            'customer_comment': self.customer_comment,
            'return_reason': self.return_reason,
            'purchase_date': self.purchase_date.strftime('%Y-%m-%d') if self.purchase_date else None,
            'return_date': self.return_date.strftime('%Y-%m-%d') if self.return_date else None,
            'purchase_price': self.purchase_price,
            'image_path': self.image_path,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'analysis': self.analysis.to_dict() if self.analysis else None
        }


class ReturnAnalysis(db.Model):
    __tablename__ = 'return_analysis'

    id = db.Column(db.Integer, primary_key=True)
    return_id = db.Column(db.Integer, db.ForeignKey('returns.id'), nullable=False, unique=True, index=True)
    primary_reason = db.Column(db.String(100), nullable=False)
    secondary_reason = db.Column(db.String(100), nullable=True)
    sentiment = db.Column(db.String(30), nullable=False) # Positive, Neutral, Negative
    sentiment_score = db.Column(db.Float, default=0.0) # -1.0 to 1.0
    root_cause = db.Column(db.String(100), nullable=False) # PRODUCT, SELLER, LOGISTICS, DESCRIPTION, PACKAGING, CUSTOMER EXPECTATION, SIZE INFORMATION, QUALITY, OTHER
    urgency = db.Column(db.String(30), default='Medium') # Low, Medium, High, Critical
    confidence = db.Column(db.Float, default=0.85) # 0.0 to 1.0
    recommendation = db.Column(db.Text, nullable=True)
    damage_assessment = db.Column(db.String(100), default='No obvious damage') # No obvious damage, Possible surface damage, Visible damage/defect
    damage_score = db.Column(db.Float, default=0.0) # 0 to 100
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'return_id': self.return_id,
            'primary_reason': self.primary_reason,
            'secondary_reason': self.secondary_reason,
            'sentiment': self.sentiment,
            'sentiment_score': self.sentiment_score,
            'root_cause': self.root_cause,
            'urgency': self.urgency,
            'confidence': round(self.confidence * 100, 1),
            'recommendation': self.recommendation,
            'damage_assessment': self.damage_assessment,
            'damage_score': self.damage_score,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(30), default='Warning') # Critical, Warning, Info, Success
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True, index=True)
    status = db.Column(db.String(30), default='unread') # unread, read, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True, index=True)
    problem = db.Column(db.String(255), nullable=False)
    recommendation = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(30), default='Medium') # High, Medium, Low
    evidence = db.Column(db.Text, nullable=False)
    estimated_benefit = db.Column(db.Float, default=0.0) # estimated monetary savings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else 'All Products / Category',
            'problem': self.problem,
            'recommendation': self.recommendation,
            'priority': self.priority,
            'evidence': self.evidence,
            'estimated_benefit': self.estimated_benefit,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AIInsight(db.Model):
    __tablename__ = 'ai_insights'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(30), default='Medium')
    evidence = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    affected_products_json = db.Column(db.Text, nullable=True) # JSON string list of product names/IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        affected = []
        if self.affected_products_json:
            try:
                affected = json.loads(self.affected_products_json)
            except Exception:
                affected = []
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'evidence': self.evidence,
            'category': self.category,
            'affected_products': affected,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    date_range = db.Column(db.String(100), default='All Time')
    generated_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'filename': self.filename,
            'date_range': self.date_range,
            'generated_by': self.generated_by.name if self.generated_by else 'System Administrator',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Setting(db.Model):
    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.Text, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
