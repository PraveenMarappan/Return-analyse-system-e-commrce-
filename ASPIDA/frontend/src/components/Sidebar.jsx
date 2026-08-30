import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  RotateCcw, 
  Package, 
  Sparkles, 
  ShieldAlert, 
  Lightbulb, 
  Calculator, 
  FileText, 
  Bell, 
  Users, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed, setCollapsed, user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'analyst';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Analyze Return', path: '/returns/analyze', icon: Sparkles, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Returns', path: '/returns', icon: RotateCcw, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager', 'analyst'] },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Risk Monitor', path: '/risk-monitor', icon: ShieldAlert, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Recommendations', path: '/recommendations', icon: Lightbulb, roles: ['admin', 'manager', 'analyst'] },
    { label: 'What-If Simulator', path: '/simulator', icon: Calculator, roles: ['admin', 'manager'] },
    { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Alerts', path: '/alerts', icon: Bell, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'manager', 'analyst'] },
    { label: 'Users', path: '/users', icon: Users, roles: ['admin'] }
  ];

  return (
    <aside style={{
      width: collapsed ? '80px' : '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* Brand Logo Header */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Shield size={22} />
          </div>
          {!collapsed && (
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', lineHeight: 1 }}>ASPIDA</h1>
              <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>AI RETURN INTELLIGENCE</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.filter(item => item.roles.includes(role)).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start'
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile / Logout Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px'
      }}>
        {!collapsed && user && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 500
          }}
          title="Sign out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
