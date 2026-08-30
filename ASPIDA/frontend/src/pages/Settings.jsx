import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Bell, Key, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    autoAlerts: true,
    riskThreshold: 65,
    emailNotifications: true,
    aiModel: 'aspida-ensemble-v2',
    currency: 'INR'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">System Settings & Threshold Controls</h1>
          <p className="page-subtitle">Configure ASPIDA risk scoring parameters, notification preferences, and system defaults</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '28px' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Risk Thresholds */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#2563eb" /> Risk Scoring Parameters
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>High Risk Trigger Score Threshold</span>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{config.riskThreshold}/100</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={config.riskThreshold}
                    onChange={(e) => setConfig({ ...config, riskThreshold: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    SKUs with risk scores at or above this threshold will automatically flag alerts and recommend operational quarantine.
                  </p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#2563eb" /> Alert Dispatch & Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={config.autoAlerts}
                    onChange={(e) => setConfig({ ...config, autoAlerts: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  Enable real-time high risk returns notification push
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={config.emailNotifications}
                    onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  Dispatch daily executive summary email reports to stakeholders
                </label>
              </div>
            </div>

            {/* AI Model Selection */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#2563eb" /> AI Engine Model Config
              </h3>
              <div className="grid-2" style={{ gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label className="form-label">Active Inference Engine</label>
                  <select
                    className="form-select"
                    value={config.aiModel}
                    onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                  >
                    <option value="aspida-ensemble-v2">ASPIDA Hybrid Ensemble v2 (Recommended)</option>
                    <option value="aspida-deep-nlp">ASPIDA Deep NLP Reason Extractor</option>
                    <option value="aspida-light-rf">ASPIDA Random Forest Classifier</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">System Default Currency</label>
                  <select
                    className="form-select"
                    value={config.currency}
                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
              </div>
            </div>

            {saved && (
              <div style={{ padding: '12px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <Check size={18} /> Settings successfully updated.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} /> Save Configuration
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
