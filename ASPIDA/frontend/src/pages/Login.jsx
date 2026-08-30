import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@aspida.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const cleanEmail = (email || '').trim().toLowerCase();
    
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(cleanEmail);
      if (res.success) {
        if (res.role === 'admin') {
          navigate('/admin');
        } else if (res.role === 'manager') {
          navigate('/manager');
        } else if (res.role === 'analyst') {
          navigate('/analyst');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'This demo account is not registered. Please use one of the demo emails.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please use one of the demo emails.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Shield size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>ASPIDA</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            AI-Powered Return Intelligence & Prevention Platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                placeholder="admin@aspida.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            DEMO ROLE FAST-FILL
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@aspida.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('manager@aspida.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('analyst@aspida.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
            >
              Analyst
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
