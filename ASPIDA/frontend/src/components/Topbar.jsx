import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { productService } from '../services/productService';

const Topbar = ({ user, alertCount = 2 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await productService.getProducts({ search: query });
        if (res.success) {
          setSearchResults(res.data.slice(0, 5));
        }
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Global Search Input */}
      <div style={{ position: 'relative', width: '360px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f1f5f9',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search products, SKUs, return issues..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f8fafc' }}>
              MATCHING PRODUCTS ({searchResults.length})
            </div>
            {searchResults.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  navigate(`/products`);
                }}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku} | {p.category}</p>
                </div>
                <span className={`badge ${p.risk_score >= 50 ? 'badge-danger' : 'badge-success'}`}>
                  Risk {p.risk_score || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Topbar Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications Icon Button */}
        <button
          onClick={() => navigate('/alerts')}
          style={{
            position: 'relative',
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
          title="System Alerts"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {alertCount}
            </span>
          )}
        </button>

        {/* User Role Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            background: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{user?.name || 'User'}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{user?.role || 'Analyst'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
