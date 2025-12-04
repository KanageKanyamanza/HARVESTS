import React from 'react';
import { Link } from 'react-router-dom';

const StatCards = ({ statCards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((card, index) => (
        <Link
          key={index}
          to={card.link}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-3">
            <div className="flex flex-wrap text-center items-center">
              <div className={`p-2 gap-2 mx-auto text-center flex rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
                <p className="text-sm font-medium text-white">{card.title}</p>
              </div>
              <div className="text-center mx-auto w-full mt-2">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.change}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default StatCards;

