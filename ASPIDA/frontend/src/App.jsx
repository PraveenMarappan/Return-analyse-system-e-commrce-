import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalyzeReturn from './pages/AnalyzeReturn';
import ReturnsList from './pages/ReturnsList';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import AIInsights from './pages/AIInsights';
import RiskMonitor from './pages/RiskMonitor';
import Recommendations from './pages/Recommendations';
import Simulator from './pages/Simulator';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="manager" element={<Navigate to="/dashboard" replace />} />
            <Route path="analyst" element={<Navigate to="/dashboard" replace />} />
            
            {/* Returns & Analyze */}
            <Route path="returns" element={<ReturnsList />} />
            <Route path="returns/analyze" element={<AnalyzeReturn />} />
            <Route path="analyze" element={<AnalyzeReturn />} />
            
            {/* Products & Details */}
            <Route path="products" element={<ProductsList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
            {/* AI Insights & Risk Monitor */}
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="risk-monitor" element={<RiskMonitor />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="simulator" element={<Simulator />} />
            
            {/* Reports, Alerts & Settings */}
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Admin Users Management */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            
            {/* Genuinely invalid route under layout */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Genuinely invalid route at root level */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

