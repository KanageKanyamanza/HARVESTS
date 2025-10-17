import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const SalesChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-harvests-light rounded-lg">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatMonth = (month) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'sales' ? formatCurrency(value) : value,
              name === 'sales' ? 'Ventes' : 'Commandes'
            ]}
            labelFormatter={(label) => formatMonth(label)}
          />
          <Bar dataKey="sales" fill="#3B82F6" name="Ventes" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatMonth}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip 
          formatter={(value, name) => [
            name === 'sales' ? formatCurrency(value) : value,
            name === 'sales' ? 'Ventes' : 'Commandes'
          ]}
          labelFormatter={(label) => formatMonth(label)}
        />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          name="Ventes"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
