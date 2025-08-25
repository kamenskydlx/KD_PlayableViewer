import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import DashboardTab from '../components/admin/DashboardTab';
import PlayablesTab from '../components/admin/PlayablesTab';
import UploadTab from '../components/admin/UploadTab';
import SettingsTab from '../components/admin/SettingsTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'playables':
        return <PlayablesTab />;
      case 'upload':
        return <UploadTab onUploadSuccess={() => setActiveTab('playables')} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Обзор - Админка';
      case 'playables':
        return 'Плейблы - Админка';
      case 'upload':
        return 'Загрузка - Админка';
      case 'settings':
        return 'Настройки - Админка';
      default:
        return 'Админка';
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - Playable Viewer</title>
        <meta name="description" content="Административная панель управления плейблами" />
      </Helmet>
      
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;