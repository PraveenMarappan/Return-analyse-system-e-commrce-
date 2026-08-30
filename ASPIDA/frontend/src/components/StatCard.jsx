import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#2563eb', trend }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        {Icon && (
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            {trend && <span style={{ color: trend.startsWith('+') || trend.includes('Increased') ? '#ef4444' : '#10b981', fontWeight: 700, marginRight: '4px' }}>{trend}</span>}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
