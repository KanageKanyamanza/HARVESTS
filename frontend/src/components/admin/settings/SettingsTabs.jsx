import React from 'react';
import { User, Mail, Lock } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Mail },
  { id: 'password', label: 'Mot de passe', icon: Lock },
];

const SettingsTabs = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white rounded-lg shadow p-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors mb-2 ${
              activeTab === tab.id
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsTabs;

