import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { SentimentBadge, StatusBadge } from '../components/Badges';
import { aiService } from '../services/aiService';
import { productService } from '../services/productService';
import { RETURN_REASONS } from '../utils/constants';

const AnalyzeReturn = () => {
  const [products, setProducts] = useState([]);
  const [comment, setComment] = useState('The shoe is smaller than expected and uncomfortable.');
  const [productId, setProductId] = useState('');
  const [returnReason, setReturnReason] = useState('Size Issue');
  const [purchasePrice, setPurchasePrice] = useState('4999');
  const [imageFile, setImageFile] = useState(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      if (res.success && res.data.length > 0) {
        setProducts(res.data);
        setProductId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter a customer return comment.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        customer_comment: comment,
        product_id: productId,
        return_reason: returnReason,
        purchase_price: purchasePrice
      };

      const res = await aiService.analyzeReturn(payload, imageFile);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(err.message || 'Error processing AI analysis pipeline.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Return Analyzer</h1>
          <p className="page-subtitle">Test live AI NLP classification, sentiment analysis, root cause, and OpenCV damage processing</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Input Form Card */}
        <div className="card">
          <div className="card-title">
            <Sparkles size={18} color="var(--primary)" /> Return Details
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Customer Return Comment *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter customer feedback or return request text..."
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-select"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Declared Return Reason</label>
                <select
                  className="form-select"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  {RETURN_REASONS.filter(r => r !== 'All').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <FileUploader
              selectedFile={imageFile}
              onFileSelected={(file) => setImageFile(file)}
              onClearFile={() => setImageFile(null)}
            />

            {error && (
              <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={analyzing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600 }}
            >
              {analyzing ? 'Running AI Pipeline...' : 'Analyze Return'}
              {!analyzing && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Output Result Card */}
        <div className="card" style={{ backgroundColor: '#ffffff', minHeight: '400px' }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span><CheckCircle size={18} color="#10b981" /> AI Intelligence Output</span>
            {result && (
              <span className="badge badge-info">
                Confidence {result.confidence}%
              </span>
            )}
          </div>

          {!result && !analyzing && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <Sparkles size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: '#475569' }}>Ready for Analysis</p>
              <p style={{ fontSize: '0.85rem' }}>Submit a customer return comment to trigger NLP & sentiment breakdown.</p>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--primary)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>Processing AI Orchestration Pipeline...</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                Running TF-IDF Vectorization ➔ Reason Classifier ➔ Sentiment Analyzer ➔ Root Cause Engine
              </p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Primary & Secondary Reason */}
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PRIMARY CLASSIFIED REASON</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {result.primary_reason}
                </h3>
                {result.secondary_reason && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Secondary Reason: <b>{result.secondary_reason}</b>
                  </p>
                )}
              </div>

              {/* Sentiment & Urgency Row */}
              <div className="grid-2">
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b' }}>SENTIMENT</p>
                  <div style={{ marginTop: '4px' }}>
                    <SentimentBadge sentiment={result.sentiment} score={result.sentiment_score} />
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b' }}>ROOT CAUSE CATEGORY</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {result.root_cause}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>ACTIONABLE AI RECOMMENDATION</p>
                <p style={{ fontSize: '0.875rem', color: '#1e3a8a', marginTop: '6px', lineHeight: 1.4, fontWeight: 500 }}>
                  {result.recommendation}
                </p>
              </div>

              {/* Image Damage OpenCV Output */}
              {result.image_analysis && result.image_analysis.success && (
                <div style={{ padding: '14px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} /> OPENCV DAMAGE ANALYSIS
                  </p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350f', marginTop: '4px' }}>
                    {result.image_analysis.damage_assessment} (Damage Score: {result.image_analysis.damage_score}/100)
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '2px', italic: 'true' }}>
                    {result.image_analysis.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeReturn;
