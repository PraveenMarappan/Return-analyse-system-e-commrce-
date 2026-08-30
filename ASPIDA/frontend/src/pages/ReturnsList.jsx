import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { returnService } from '../services/returnService';
import { SentimentBadge, StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { formatDate, formatCurrency } from '../utils/formatters';
import { CATEGORIES, RETURN_REASONS, SENTIMENTS, STATUSES } from '../utils/constants';

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [reason, setReason] = useState('All');
  const [sentiment, setSentiment] = useState('All');
  const [status, setStatus] = useState('All');

  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [page, category, reason, sentiment, status]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search,
        category,
        reason,
        sentiment,
        status
      };
      const res = await returnService.getReturns(params);
      if (res.success) {
        setReturns(res.data.returns);
        setTotal(res.data.total);
        setTotalPages(res.data.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReturns();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Return Records Management</h1>
          <p className="page-subtitle">Search, filter, and inspect detailed return requests and AI diagnostic breakdowns</p>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search comments, products, SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: '150px' }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="All">Category: All</option>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="form-select" style={{ width: '160px' }} value={reason} onChange={(e) => { setReason(e.target.value); setPage(1); }}>
            <option value="All">Reason: All</option>
            {RETURN_REASONS.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="form-select" style={{ width: '150px' }} value={sentiment} onChange={(e) => { setSentiment(e.target.value); setPage(1); }}>
            <option value="All">Sentiment: All</option>
            {SENTIMENTS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Returns Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Return Reason</th>
              <th>Sentiment</th>
              <th>Price</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>Loading returns data...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No return records found matching filters.</td></tr>
            ) : (
              returns.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>#{r.id}</td>
                  <td>
                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{r.product_name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {r.product_sku}</p>
                  </td>
                  <td>{r.category}</td>
                  <td style={{ fontWeight: 500 }}>{r.return_reason}</td>
                  <td>
                    {r.analysis ? (
                      <SentimentBadge sentiment={r.analysis.sentiment} score={r.analysis.sentiment_score} />
                    ) : <span className="badge badge-neutral">Pending</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(r.purchase_price)}</td>
                  <td>{formatDate(r.return_date)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setSelectedReturn(r)}
                    >
                      <Eye size={14} /> View Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing page {page} of {totalPages} ({total} total records)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Return Detail Modal */}
      {selectedReturn && (
        <Modal
          title={`Return Request #${selectedReturn.id} Detail`}
          onClose={() => setSelectedReturn(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid-2">
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PRODUCT</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedReturn.product_name}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>SKU: {selectedReturn.product_sku} | Category: {selectedReturn.category}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PURCHASE PRICE</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{formatCurrency(selectedReturn.purchase_price)}</p>
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CUSTOMER COMMENT</p>
              <p style={{ fontSize: '0.9rem', color: '#1e293b', marginTop: '4px', italic: 'true' }}>"{selectedReturn.customer_comment}"</p>
            </div>

            {selectedReturn.analysis && (
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>AI DIAGNOSTIC REPORT</p>
                <div className="grid-2" style={{ marginTop: '8px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#1e40af' }}>Classified Reason:</p>
                    <p style={{ fontWeight: 700, color: '#1e3a8a' }}>{selectedReturn.analysis.primary_reason}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#1e40af' }}>Root Cause:</p>
                    <p style={{ fontWeight: 700, color: '#1e3a8a' }}>{selectedReturn.analysis.root_cause}</p>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#1e40af' }}>AI Recommendation:</p>
                  <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '2px', fontWeight: 500 }}>{selectedReturn.analysis.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReturnsList;
