import React, { useState, useEffect } from 'react';
import { Calculator, PiggyBank, TrendingDown, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { aiService } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';

const Simulator = () => {
  const [currentReturns, setCurrentReturns] = useState(1000);
  const [expectedReductionPct, setExpectedReductionPct] = useState(30);
  const [avgReturnCost, setAvgReturnCost] = useState(250);
  const [avgProductPrice, setAvgProductPrice] = useState(1200);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
  }, []);

  const runSimulation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        current_returns: currentReturns,
        expected_reduction_pct: expectedReductionPct,
        avg_return_cost: avgReturnCost,
        avg_product_price: avgProductPrice
      };
      const res = await aiService.calculateSimulation(payload);
      if (res.success) setSimResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = simResult ? [
    { name: 'Current Baseline Loss', cost: simResult.before_cost },
    { name: 'Projected Loss (With ASPIDA)', cost: simResult.after_cost }
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">What-If Financial Impact Simulator</h1>
          <p className="page-subtitle">Simulate potential cost savings and prevented return volume under preventive intervention scenarios</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Controls Card */}
        <div className="card">
          <div className="card-title">
            <Calculator size={18} color="var(--primary)" /> Scenario Inputs & Parameters
          </div>

          <form onSubmit={runSimulation}>
            <div className="form-group">
              <label className="form-label">Current Annual Returns Count</label>
              <input
                type="number"
                className="form-input"
                value={currentReturns}
                onChange={(e) => setCurrentReturns(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Return Reduction Target ({expectedReductionPct}%)</label>
              <input
                type="range"
                min="5"
                max="75"
                step="5"
                value={expectedReductionPct}
                onChange={(e) => setExpectedReductionPct(e.target.value)}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>5% (Conservative)</span>
                <span>30% (Recommended)</span>
                <span>75% (Maximum)</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Avg Return Handling Cost (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={avgReturnCost}
                  onChange={(e) => setAvgReturnCost(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avg Product Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={avgProductPrice}
                  onChange={(e) => setAvgProductPrice(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              {loading ? 'Calculating...' : 'Recalculate Savings Projections'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Financial KPI Output Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StatCard
            title="ESTIMATED FINANCIAL SAVINGS"
            value={simResult ? formatCurrency(simResult.estimated_savings) : '---'}
            subtitle={`Based on ${expectedReductionPct}% return reduction`}
            icon={PiggyBank}
            color="#10b981"
          />

          <StatCard
            title="PREVENTED RETURN REQUESTS"
            value={simResult ? `${simResult.prevented_returns} Returns` : '---'}
            subtitle={`New annual returns count: ${simResult ? simResult.new_returns : 0}`}
            icon={TrendingDown}
            color="#2563eb"
          />
        </div>
      </div>

      {/* Comparison Recharts Visualization */}
      {simResult && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title">Before vs After Return Cost Comparison</div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulator;
