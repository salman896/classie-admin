import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Recommendations from './pages/Recommendations';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Influencers from './pages/Influencers';
import Notifications from './pages/Notifications';

const AdminLayout = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'influencers':
        return <Influencers />;
      case 'recommendations':
        return <Recommendations />;
      case 'products':
        return <Products />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'orders':
        return 'Order Management & Fulfillment';
      case 'customers':
        return 'Customer Database';
      case 'influencers':
        return 'Influencer & Partner Approvals';
      case 'recommendations':
        return 'Cycle Recommendation Plans';
      case 'products':
        return 'Catalogue & Inventory';
      case 'notifications':
        return 'Customer Push Notifications';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminLayout />
    </AuthProvider>
  );
}
