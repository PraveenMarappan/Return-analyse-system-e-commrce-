import React from 'react';

export const RiskBadge = ({ score, status }) => {
  let badgeClass = 'badge-success';
  let label = status || 'LOW';

  if (score >= 75 || status === 'CRITICAL') {
    badgeClass = 'badge-danger';
    label = `CRITICAL (${score})`;
  } else if (score >= 50 || status === 'HIGH') {
    badgeClass = 'badge-danger';
    label = `HIGH (${score})`;
  } else if (score >= 25 || status === 'MEDIUM') {
    badgeClass = 'badge-warning';
    label = `MEDIUM (${score})`;
  } else {
    badgeClass = 'badge-success';
    label = `LOW (${score})`;
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

export const SentimentBadge = ({ sentiment, score }) => {
  let badgeClass = 'badge-neutral';
  if (sentiment === 'Positive') badgeClass = 'badge-success';
  if (sentiment === 'Negative') badgeClass = 'badge-danger';
  if (sentiment === 'Neutral') badgeClass = 'badge-warning';

  return (
    <span className={`badge ${badgeClass}`}>
      {sentiment} {score !== undefined ? `(${score})` : ''}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-info';
  if (status === 'Processed' || status === 'Resolved' || status === 'read') badgeClass = 'badge-success';
  if (status === 'Pending' || status === 'unread') badgeClass = 'badge-warning';
  if (status === 'Closed' || status === 'Critical') badgeClass = 'badge-danger';

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
