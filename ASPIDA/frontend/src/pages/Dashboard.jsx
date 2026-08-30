import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  RotateCcw, 
  Percent, 
  ShieldAlert, 
  IndianRupee, 
  PiggyBank, 
  Filter, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import StatCard from '../components/StatCard';
import { RiskBadge } from '../components/Badges';
import { aiService } from '../services/aiService';
import { productService } from '../services/productService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCategory, selectedProduct]);

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      if (res.success) setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedProduct !== 'All') params.product = selectedProduct;

      const [sumRes, trendRes, reasonRes, catRes] = await Promise.all([
        aiService.getDashboardSummary(params),
        aiService.getDashboardTrends(params),
        aiService.getDashboardReasons(params),
        aiService.getDashboardCategories(params)
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success && reasonRes.success && catRes.success) {
        setCharts({
          trends: trendRes.data.return_trends,
          reasons: reasonRes.data,
          categories: catRes.data,
          sentiments: trendRes.data.sentiments || [
            { sentiment: 'Negative', count: 62 },
            { sentiment: 'Neutral', count: 28 },
            { sentiment: 'Positive', count: 10 }
          ],
          topProblematic: trendRes.data.top_problematic_products || []
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header & Filter Bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time e-commerce return analytics & risk intelligence</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
            <Filter size={16} /> Filters:
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '160px' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="All">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="TOTAL ORDERS"
          value={summary ? summary.total_orders.toLocaleString() : '---'}
          subtitle="Portfolio baseline"
          icon={ShoppingBag}
          color="#2563eb"
        />
        <StatCard
          title="TOTAL RETURNS"
          value={summary ? summary.total_returns.toLocaleString() : '---'}
          subtitle="Processed requests"
          icon={RotateCcw}
          color="#f59e0b"
        />
        <StatCard
          title="RETURN RATE"
          value={summary ? formatPercent(summary.return_rate) : '---'}
          subtitle="Target threshold: 10.0%"
          trend={summary && summary.return_rate > 10.0 ? '+4.7% vs target' : 'Normal'}
          icon={Percent}
          color={summary && summary.return_rate > 10.0 ? '#ef4444' : '#10b981'}
        />
        <StatCard
          title="HIGH-RISK PRODUCTS"
          value={summary ? summary.high_risk_products : '---'}
          subtitle="Requires intervention"
          icon={ShieldAlert}
          color="#ef4444"
        />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <StatCard
          title="ESTIMATED RETURN COST"
          value={summary ? formatCurrency(summary.estimated_return_cost) : '---'}
          subtitle="Includes refunds + operational handling"
          icon={IndianRupee}
          color="#8b5cf6"
        />
        <StatCard
          title="POTENTIAL SAVINGS"
          value={summary ? formatCurrency(summary.potential_savings) : '---'}
          subtitle="Targeting 35% avoidable return reduction"
          icon={PiggyBank}
          color="#10b981"
        />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Return Rate Trend Line Chart */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={18} color="#2563eb" /> Return Rate Volume Trend
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            {charts?.trends && charts.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trends}>
                  <defs>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="returns" stroke="#2563eb" fillOpacity={1} fill="url(#colorReturns)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '100px' }}>Loading chart...</p>}
          </div>
        </div>

        {/* Returns by Reason Bar Chart */}
        <div className="card">
          <div className="card-title">
            <RotateCcw size={18} color="#f59e0b" /> Top Return Reasons
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            {charts?.reasons && charts.reasons.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.reasons.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={11} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '100px' }}>Loading chart...</p>}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-title">Returns by Product Category</div>
          <div style={{ height: '220px', width: '100%' }}>
            {charts?.categories ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.categories} dataKey="returns" nameKey="category" cx="50%" cy="50%" outerRadius={70} label>
                    {charts.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Top Problematic Products Table Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span><AlertTriangle size={18} color="#ef4444" /> High Risk Products</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Updated Live</span>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Return Rate</th>
                  <th>Risk Score</th>
                  <th>Top Complaint</th>
                </tr>
              </thead>
              <tbody>
                {charts?.topProblematic?.slice(0, 4).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{formatPercent(p.return_rate)}</td>
                    <td><RiskBadge score={p.risk_score} /></td>
                    <td>{p.top_complaint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
