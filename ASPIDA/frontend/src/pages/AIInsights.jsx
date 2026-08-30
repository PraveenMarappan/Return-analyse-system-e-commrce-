import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIInsights = () => {
  const [data, setData] = useState({ insights: [], clusters: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await aiService.getAIInsights();
      if (res.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Hidden Pattern & Recurring Issue Discovery</h1>
          <p className="page-subtitle">Machine learning KMeans comment clustering and automated pattern anomaly detection</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Discovering ML return pattern clusters...</p>
      ) : (
        <>
          {/* Dynamic ML Clusters */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--primary)" /> Discovered Recurring Return Complaint Clusters
          </h2>

          <div className="grid-2" style={{ marginBottom: '32px' }}>
            {data.clusters && data.clusters.map(cluster => (
              <div className="card" key={cluster.cluster_id} style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-info">Cluster #{cluster.cluster_id}</span>
                  <span className={`badge ${cluster.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                    {cluster.severity} Severity
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{cluster.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                  Volume: <b>{cluster.returns_count} returns ({cluster.percentage_of_total}% of total return database)</b>
                </p>

                {/* Keywords Tag cloud */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {cluster.keywords.map(kw => (
                    <span key={kw} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Suggested Action */}
                <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SUGGESTED INTERVENTION</p>
                  <p style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>{cluster.suggested_action}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Platform AI Insights List */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#f59e0b" /> Automated Anomaly Insights
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.insights && data.insights.map(item => (
              <div className="card" key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CATEGORY: {item.category}</span>
                  <span className={`badge ${item.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>{item.severity}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.4 }}>{item.description}</p>

                <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>EVIDENCE LOG</p>
                  <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '2px' }}>{item.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AIInsights;
