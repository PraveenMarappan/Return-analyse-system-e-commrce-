import React, { useState, useEffect } from 'react';
import { Lightbulb, IndianRupee, ArrowRight, ShieldCheck } from 'lucide-react';
import { aiService } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await aiService.getRecommendations();
      if (res.success) setRecommendations(res.data);
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
          <h1 className="page-title">AI Actionable Business Recommendations</h1>
          <p className="page-subtitle">Targeted interventions to reduce return rate, fix sizing mismatch, and optimize product packaging</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Generating business recommendations...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recommendations.map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                borderLeft: `4px solid ${item.priority === 'High' ? '#ef4444' : (item.priority === 'Medium' ? '#f59e0b' : '#3b82f6')}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${item.priority === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                      {item.priority} Priority
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                      AFFECTED ITEM: {item.product_name}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
                    Problem: {item.problem}
                  </h3>
                </div>

                {/* Estimated Financial Benefit Tag */}
                <div style={{
                  padding: '8px 16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  textAlign: 'right'
                }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857' }}>ESTIMATED BENEFIT</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(item.estimated_benefit)} / yr
                  </p>
                </div>
              </div>

              {/* Recommendation Box */}
              <div style={{ marginTop: '14px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={16} /> RECOMMENDED PREVENTIVE ACTION
                </p>
                <p style={{ fontSize: '0.9rem', color: '#1e3a8a', marginTop: '4px', fontWeight: 500, lineHeight: 1.4 }}>
                  {item.recommendation}
                </p>
              </div>

              {/* Evidence */}
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>
                <b>Data Evidence:</b> {item.evidence}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
