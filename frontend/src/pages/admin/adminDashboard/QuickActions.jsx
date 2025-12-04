import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const QuickActions = ({ quickActions }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-harvests-light transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.value} éléments</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

