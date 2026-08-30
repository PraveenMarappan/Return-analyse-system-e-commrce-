# ASPIDA — AI-Powered Return Intelligence & Prevention Platform

> **Tagline**: *"Understand Returns. Prevent Problems. Improve Products."*

ASPIDA is an enterprise-grade SaaS web application built to help e-commerce businesses analyze, quantify, and prevent product return requests. By leveraging Machine Learning (TF-IDF + Logistic Regression), NLP sentiment scoring, KMeans topic clustering, and OpenCV visual damage processing, ASPIDA transforms raw customer return text and metadata into actionable business interventions and financial savings.

---

## 1. Features & Capabilities

- **Executive KPI Dashboard**: Real-time metrics for total orders, total returns, return rate %, high-risk products, estimated financial cost, and potential savings.
- **Smart Return Analyzer**: Interactive live tool classifying primary/secondary reasons, sentiment, confidence, root cause, and recommendations. Supports OpenCV damage image processing.
- **Return Reason ML Classifier**: TF-IDF vectorization + Logistic Regression classifying returns across 11 classes (Size Issue, Quality Defect, Transit Damage, Wrong Product, etc.).
- **Product Risk Scoring (0–100)**: Multi-factor internal risk formula assessing return rate velocity, negative sentiment ratio, quality complaint density, and spike trends.
- **Product Health Score (0–100)**: Inverted health score (`100 - Risk Score`) measuring product line viability.
- **Recurring Issue Discovery**: Unsupervised KMeans clustering discovering hidden complaint topics across return comments.
- **Early Warning Risk Monitor**: Automated anomaly alerts flagging sudden complaint surges and inventory batch quality defects.
- **AI Business Recommendations**: Actionable advice paired with estimated annual monetary savings.
- **What-If Financial Impact Simulator**: Scenario planning calculator modeling return rate reduction and cost savings with Recharts visual projections.
- **PDF Report Generation**: Automated PDF executive report compilation via ReportLab.
- **Role-Based Access Control (RBAC)**: JWT authentication supporting Admin, Manager, and Analyst roles.

---

## 2. Technology Stack

- **Frontend**: React (v18), Vite, JavaScript, HTML5, CSS3 (Vanilla design system), React Router DOM (v6), Axios, Recharts, Lucide React Icons.
- **Backend**: Python 3.10+, Flask, Flask-CORS, Flask-SQLAlchemy, Flask-JWT-Extended, Werkzeug, Pandas, NumPy, Scikit-learn, OpenCV (`opencv-python-headless`), Pillow, Joblib, ReportLab.
- **Database**: SQLite (SQLAlchemy ORM).

---

## 3. Project Structure

```
ASPIDA/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── returns.py
│   │   │   ├── products.py
│   │   │   ├── analytics.py
│   │   │   ├── predictions.py
│   │   │   ├── recommendations.py
│   │   │   ├── reports.py
│   │   │   ├── alerts.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── nlp_service.py
│   │   │   ├── sentiment_service.py
│   │   │   ├── risk_service.py
│   │   │   ├── clustering_service.py
│   │   │   ├── recommendation_service.py
│   │   │   ├── image_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── report_service.py
│   │   ├── ml/
│   │   │   ├── train_models.py
│   │   │   └── models/
│   │   └── utils/
│   ├── instance/
│   ├── uploads/
│   ├── reports/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_api.py
│   │   └── test_ml.py
│   ├── seed_database.py
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Backend Installation & Startup
```bash
# Navigate to backend directory
cd ASPIDA/backend

# Install python dependencies
pip install -r requirements.txt

# Seed database and train ML models (Creates 47 products, 500+ returns, demo users, trained models)
python seed_database.py

# Run Flask backend server (Starts on http://localhost:5000)
python run.py
```

### Frontend Installation & Startup
```bash
# Open a new terminal and navigate to frontend directory
cd ASPIDA/frontend

# Install npm packages
npm install

# Run Vite development server (Starts on http://localhost:3000)
npm run dev
```

---

## 5. Demo Login Credentials

The database is pre-seeded with 3 role accounts (`password123` for all):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Manager** | `manager@aspida.com` | `password123` | Dashboard, Returns, Products, Analytics, Recommendations, Reports, Simulator |
| **Admin** | `admin@aspida.com` | `password123` | Full Access + User & Access Management |
| **Analyst** | `analyst@aspida.com` | `password123` | Returns, Products, Analytics, Reports |

---

## 6. Testing

Backend unit tests can be executed via pytest/unittest:
```bash
cd ASPIDA/backend
python -m unittest discover -s tests
```

---

## 7. Machine Learning & AI Pipeline

1. **Return Reason Classifier**: Built using Scikit-Learn `TfidfVectorizer` (ngram range 1-2) + `LogisticRegression` trained on return request text to output top class, secondary class, and confidence score.
2. **Sentiment Engine**: TF-IDF + LogisticRegression model scoring sentiment continuous value from `-1.0` (negative) to `+1.0` (positive).
3. **Clustering Engine**: `KMeans` clustering over comment vectors discovering topic clusters (e.g. Sizing Inconsistencies, Packaging Vulnerability, Battery Quality Anomaly).
4. **Computer Vision Damage Analysis**: OpenCV edge density (`Canny`), Laplacian variance (`Laplacian.var()`), and color standard deviation computing preliminary visual damage score (0–100).
5. **Product Risk Formula**:
   $$\text{RiskScore} = \text{min}\Big(100, \text{round}\big(0.35 \cdot \text{ReturnRateFactor} + 0.25 \cdot \text{NegSentimentPct} + 0.20 \cdot \text{QualitySizeComplaintPct} + 0.20 \cdot \text{SpikeTrendPct}\big)\Big)$$

---

## 8. API Summary

- `POST /api/auth/login` — Authenticate user & get JWT token
- `GET /api/dashboard/summary` — Retrieve executive KPI summary
- `GET /api/dashboard/trends` — Retrieve Recharts monthly trend datasets
- `POST /api/ai/analyze-return` — Single-item ML NLP & OpenCV damage prediction
- `GET /api/ai/insights` — Retrieve pattern anomalies & KMeans complaint clusters
- `GET /api/ai/recommendations` — Retrieve actionable recommendations & financial benefits
- `POST /api/simulator/calculate` — What-If savings scenario calculator
- `POST /api/reports/generate` — Compile & export ReportLab PDF report
- `GET /api/alerts` — System early warning alert notifications
- `GET /api/admin/users` — Admin user management (Admin role required)
