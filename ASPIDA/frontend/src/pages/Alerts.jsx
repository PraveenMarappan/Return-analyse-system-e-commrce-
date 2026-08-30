import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { aiService } from '../services/aiService';
import { StatusBadge } from '../components/Badges';
import { formatDate } from '../utils/formatters';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = filter !== 'All' ? { status: filter } : {};
      const res = await aiService.getAlerts(params);
      if (res.success) setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'read') await aiService.markAlertRead(id);
      if (action === 'resolve') await aiService.markAlertResolved(id);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification & Alert Center</h1>
          <p className="page-subtitle">Manage platform early warning alerts, anomaly notifications, and resolution status</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('All')}>All</button>
          <button className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('unread')}>Unread</button>
          <button className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('resolved')}>Resolved</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Alert Title</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading alerts...</td></tr>
            ) : alerts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No alerts found.</td></tr>
            ) : (
              alerts.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>#{a.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.title}</td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>{a.description}</td>
                  <td><StatusBadge status={a.severity} /></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(a.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {a.status === 'unread' && (
                        <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => handleAction(a.id, 'read')}>
                          Mark Read
                        </button>
                      )}
                      {a.status !== 'resolved' && (
                        <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => handleAction(a.id, 'resolve')}>
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
