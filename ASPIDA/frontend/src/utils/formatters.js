export const formatCurrency = (amount, currency = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currency}0`;
  if (amount >= 100000) {
    return `${currency}${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${currency}${(amount / 1000).toFixed(1)}k`;
  }
  return `${currency}${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

export const formatPercent = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(1)}%`;
};
