import React from 'react';
import { useTranslation } from 'react-i18next';

const VehicleCapacity = ({ capacity, onInputChange }) => {
  const { t } = useTranslation('dashboard-transporter');
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t('vehicle.form.capacity')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('vehicle.form.weight')}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              name="capacity.weight.value"
              value={capacity.weight.value}
              onChange={onInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
            <select
              name="capacity.weight.unit"
              value={capacity.weight.unit}
              onChange={onInputChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              <option value="kg">{t('vehicle.units.kg')}</option>
              <option value="tons">{t('vehicle.units.tons')}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fleet.volume')}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              name="capacity.volume.value"
              value={capacity.volume.value}
              onChange={onInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
            <select
              name="capacity.volume.unit"
              value={capacity.volume.unit}
              onChange={onInputChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              <option value="m³">{t('vehicle.units.m³')}</option>
              <option value="liters">{t('vehicle.units.liters')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCapacity;

