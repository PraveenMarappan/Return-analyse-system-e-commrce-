import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        marginBottom: '20px',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1)'
      }}>
        <AlertTriangle size={36} />
      </div>

      <span style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#ef4444',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '8px'
      }}>
        Error 404
      </span>

      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '12px',
        lineHeight: 1.2
      }}>
        Page Not Found
      </h1>

      <p style={{
        fontSize: '1rem',
        color: '#64748b',
        maxWidth: '420px',
        marginBottom: '28px',
        lineHeight: 1.5
      }}>
        The page you're looking for doesn't exist.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
