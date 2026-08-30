import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, BellRing, Filter } from 'lucide-react';
import { aiService } from '../services/aiService';
import { RiskBadge, StatusBadge } from '../components/Badges';

const RiskMonitor = () => {
  const [riskProducts, setRiskProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [riskRes, alertsRes] = await Promise.all([
        aiService.getRiskProducts(),
        aiService.getAlerts()
      ]);
      if (riskRes.success) setRiskProducts(riskRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      const res = await aiService.markAlertResolved(id);
      if (res.success) fetchRiskData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Early Warning Risk Monitor</h1>
          <p className="page-subtitle">Real-time anomaly monitoring, spike detection alerts, and active critical risk notifications</p>
        </div>
      </div>

      {/* Critical Alert Banner Container */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BellRing size={20} color="#ef4444" /> System Early Warning Alerts ({alerts.filter(a => a.status !== 'resolved').length} Active)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {alerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
            No active risk alerts detected. All products operating within standard thresholds.
          </div>
        ) : (
          alerts.map(a => (
            <div
              key={a.id}
              className="card"
              style={{
                borderLeft: `4px solid ${a.severity === 'Critical' ? '#ef4444' : '#f59e0b'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <AlertTriangle size={22} color={a.severity === 'Critical' ? '#ef4444' : '#f59e0b'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{a.title}</h3>
                    <StatusBadge status={a.severity} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>{a.description}</p>
                </div>
              </div>

              {a.status !== 'resolved' ? (
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleResolveAlert(a.id)}>
                  <CheckCircle size={14} color="#10b981" /> Resolve
                </button>
              ) : (
                <span className="badge badge-success">Resolved</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* High-Risk Product Monitor Grid */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={20} color="#2563eb" /> Critical & High Risk Product Watchlist
      </h2>

      <div className="grid-3">
        {riskProducts.map(p => (
          <div className="card" key={p.product_id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{p.category}</span>
                <RiskBadge score={p.risk_score} status={p.status} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{p.product_name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>SKU: {p.sku}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>RETURN RATE</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{p.return_rate}%</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>NEGATIVE SENTIMENT</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>{p.negative_sentiment_pct}%</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b' }}>TOP COMPLAINT REASON</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{p.top_complaint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskMonitor;
