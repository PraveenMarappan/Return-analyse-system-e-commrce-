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
import AIInsights from './pages/AIInsights';
import RiskMonitor from './pages/RiskMonitor';
import Recommendations from './pages/Recommendations';
import Simulator from './pages/Simulator';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analyze" element={<AnalyzeReturn />} />
            <Route path="returns" element={<ReturnsList />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="risk-monitor" element={<RiskMonitor />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route 
              path="admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
