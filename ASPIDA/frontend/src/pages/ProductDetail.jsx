import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';
import { RiskBadge } from '../components/Badges';
import { formatCurrency, formatPercent } from '../utils/formatters';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(id);
      if (res.success && res.data) {
        setProduct(res.data);
      } else {
        setError(res.message || 'Product not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <RefreshCw size={28} className="spin" style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
        <p>Loading Product Analysis #{id}...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/products" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>

        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Product Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>{error || `No product found matching ID: ${id}`}</p>
          <Link to="/products" className="btn btn-primary">
            View All Catalogue Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/products" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <RiskBadge score={product.risk_score} status={product.status} />
      </div>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            SKU: {product.sku} | Category: {product.category}
          </span>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">Granular Risk Breakdown & Comprehensive Intelligence Profile</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CATALOGUE PRICE</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {formatCurrency(product.price)}
          </h2>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RETURN RATE</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: product.return_rate >= 0.15 ? '#ef4444' : '#0f172a', marginTop: '4px' }}>
            {formatPercent(product.return_rate)}
          </h2>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>HEALTH SCORE</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: product.health_score >= 70 ? '#10b981' : (product.health_score >= 40 ? '#f59e0b' : '#ef4444'), marginTop: '4px' }}>
            {product.health_score}/100
          </h2>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RISK SCORE</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: product.risk_score >= 50 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
            {product.risk_score}/100
          </h2>
        </div>
      </div>

      {/* Risk Factors & Recommendations */}
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" /> Identifiable Risk Factors
          </h3>
          {product.factors && product.factors.length > 0 ? (
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
              {product.factors.map((factor, idx) => (
                <li key={idx} style={{ lineHeight: 1.5 }}>{factor}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No elevated risk factors detected for this SKU.</p>
          )}
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#2563eb" /> AI Recommended Interventions
          </h3>
          {product.recommendations && product.recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {product.recommendations.map((rec, idx) => (
                <div key={idx} style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '0.875rem', color: '#1e3a8a', fontWeight: 600 }}>{rec.recommendation || rec.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending action items for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
