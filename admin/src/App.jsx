import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import Dashboard from './pages/Dashboard';
import CMS from './pages/CMS';
import Login from './pages/Login';
import Register from './pages/Register';

import ManagerDashboard from './pages/ManagerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import WhatsAppCRM from './pages/WhatsAppCRM';
import Tools from './pages/Tools';
import WorkspacePage from './pages/WorkspacePage';
import Administrator from './pages/Administrator';
import Leads from './pages/Leads';
import Users from './pages/Users';

const AUTH_ROLES = ['admin', 'manager', 'agent'];

const getSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const hasAdminSession = () => {
  const token = localStorage.getItem('token');
  const user = getSessionUser();
  return Boolean(token && AUTH_ROLES.includes(user?.role));
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = hasAdminSession();

  if (isAuthPage) {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex bg-gray-50 min-h-screen justify-center items-center">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:h-screen lg:overflow-hidden">
      <Sidebar />
      {/* Right panel: header fixed at top, content scrolls below */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main Dashboards */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<Navigate to="/" replace />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            
            {/* CMS & CRM */}
            <Route path="/cms" element={<CMS />} />
            <Route path="/crm" element={<WorkspacePage module="crm" />} />
            <Route path="/whatsapp-crm" element={<WhatsAppCRM />} />
            
            {/* Communication & Tools */}
            <Route path="/communication" element={<WorkspacePage module="communication" />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/reports" element={<WorkspacePage module="reports" />} />
            
            {/* Administration */}
            <Route path="/leads" element={<Leads />} />
            <Route path="/notifications" element={<WorkspacePage module="notifications" />} />
            <Route path="/administrator" element={<Administrator />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<WorkspacePage module="settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
