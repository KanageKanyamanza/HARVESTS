import React from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CUISINE_OPTIONS = [
  { value: 'african', label: 'Africaine' },
  { value: 'french', label: 'Française' },
  { value: 'italian', label: 'Italienne' },
  { value: 'asian', label: 'Asiatique' },
  { value: 'american', label: 'Américaine' },
  { value: 'mediterranean', label: 'Méditerranéenne' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'vegetarian', label: 'Végétarienne' },
  { value: 'vegan', label: 'Végane' }
];

const COUNTRIES = [
  { code: 'SN', name: 'Sénégal' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ML', name: 'Mali' },
  { code: 'GN', name: 'Guinée' },
  { code: 'GM', name: 'Gambie' },
  { code: 'GW', name: 'Guinée-Bissau' },
  { code: 'CV', name: 'Cap-Vert' },
  { code: 'MR', name: 'Mauritanie' },
  { code: 'NE', name: 'Niger' },
  { code: 'TD', name: 'Tchad' },
  { code: 'CF', name: 'République centrafricaine' },
  { code: 'GQ', name: 'Guinée équatoriale' },
  { code: 'GA', name: 'Gabon' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'République démocratique du Congo' },
  { code: 'AO', name: 'Angola' },
  { code: 'ST', name: 'São Tomé-et-Príncipe' }
];

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const ProfileFormFields = ({
  user,
  editing,
  formData,
  verificationStatus,
  onInputChange,
  onCuisineTypeChange,
  onFormDataChange,
  safeDisplay
}) => {
  const renderField = (label, name, icon, value, type = 'text', options = null) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon && React.cloneElement(icon, { className: 'inline mr-1' })}
        {label}
      </label>
      {editing ? (
        options ? (
          <select name={name} value={formData[name] || ''} onChange={onInputChange} className={inputClass}>
            <option value="">Sélectionner...</option>
            {options.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
          </select>
        ) : (
          <input type={type} name={name} value={formData[name] || ''} onChange={onInputChange} className={inputClass} />
        )
      ) : (
        <p className="text-gray-900">{safeDisplay(value)}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Prénom', 'firstName', <FiUser />, user.firstName)}
          {renderField('Nom', 'lastName', <FiUser />, user.lastName)}
          
          {(user?.userType === 'transformer' || user?.userType === 'exporter' || user?.userType === 'transporter') && 
            renderField("Nom de l'entreprise", 'companyName', <FiUser />, user.companyName)}
          
          {user?.userType === 'producer' && 
            renderField('Nom de la ferme', 'farmName', <FiUser />, user.farmName)}
          
          {user?.userType === 'restaurateur' && 
            renderField('Nom du restaurant', 'restaurantName', <FiUser />, user.restaurantName)}

          {user?.userType === 'restaurateur' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline mr-1" />
                Types de cuisine
              </label>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  {CUISINE_OPTIONS.map(cuisine => (
                    <label key={cuisine.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={cuisine.value}
                        checked={(formData.cuisineTypes || []).includes(cuisine.value)}
                        onChange={onCuisineTypeChange}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cuisine.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(user.cuisineTypes || []).length > 0 ? (
                    user.cuisineTypes.map((type, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {CUISINE_OPTIONS.find(c => c.value === type)?.label || type}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Aucun type de cuisine renseigné</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMail className="inline mr-1" />
              Email
            </label>
            <div className="flex items-center">
              <p className="text-gray-900">{safeDisplay(user.email, '')}</p>
              {verificationStatus?.email?.verified ? (
                <FiCheckCircle className="ml-2 text-green-500" />
              ) : (
                <FiAlertCircle className="ml-2 text-red-500" />
              )}
            </div>
          </div>

          {renderField('Téléphone', 'phone', <FiPhone />, user.phone, 'tel')}
          {renderField('Adresse', 'address', <FiMapPin />, user.address)}
          {renderField('Ville', 'city', <FiMapPin />, user.city)}
          {renderField('Région', 'region', <FiMapPin />, user.region)}
          {renderField('Pays', 'country', <FiMapPin />, user.country, 'select', COUNTRIES)}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
          {editing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={onInputChange}
              rows={3}
              className={inputClass}
              placeholder="Parlez-nous de vous..."
            />
          ) : (
            <p className="text-gray-900">{safeDisplay(user.bio, 'Aucune biographie renseignée')}</p>
          )}
        </div>

        {user?.userType === 'transporter' && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline mr-1" />
              Zones de service
            </label>
            {editing ? (
              <div className="space-y-4">
                {(formData.serviceAreas || []).map((area, index) => (
                  <div key={index} className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Région *</label>
                        <input
                          type="text"
                          value={area.region || ''}
                          onChange={(e) => {
                            const newAreas = [...(formData.serviceAreas || [])];
                            newAreas[index] = { ...newAreas[index], region: e.target.value };
                            onFormDataChange({ ...formData, serviceAreas: newAreas });
                          }}
                          className={`${inputClass} text-sm`}
                          placeholder="Ex: Dakar"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Villes</label>
                        <input
                          type="text"
                          value={Array.isArray(area.cities) ? area.cities.join(', ') : (area.cities || '')}
                          onChange={(e) => {
                            const cities = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                            const newAreas = [...(formData.serviceAreas || [])];
                            newAreas[index] = { ...newAreas[index], cities };
                            onFormDataChange({ ...formData, serviceAreas: newAreas });
                          }}
                          className={`${inputClass} text-sm`}
                          placeholder="Ex: Dakar, Thiès"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rayon (km) *</label>
                        <input
                          type="number"
                          value={area.deliveryRadius || ''}
                          onChange={(e) => {
                            const newAreas = [...(formData.serviceAreas || [])];
                            newAreas[index] = { ...newAreas[index], deliveryRadius: parseFloat(e.target.value) || 0 };
                            onFormDataChange({ ...formData, serviceAreas: newAreas });
                          }}
                          className={`${inputClass} text-sm`}
                          min="0"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newAreas = (formData.serviceAreas || []).filter((_, i) => i !== index);
                        onFormDataChange({ ...formData, serviceAreas: newAreas });
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer cette zone
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onFormDataChange({
                      ...formData,
                      serviceAreas: [...(formData.serviceAreas || []), { region: '', cities: [], deliveryRadius: 0 }]
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FiMapPin className="mr-1" />
                  Ajouter une zone de service
                </button>
              </div>
            ) : (
              <div className="flex justify-around gap-3 flex-wrap">
                {user.serviceAreas?.length > 0 ? (
                  user.serviceAreas.map((area, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <p className="font-medium text-gray-900">{area.region}</p>
                      {area.cities?.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Villes: {Array.isArray(area.cities) ? area.cities.join(', ') : area.cities}
                        </p>
                      )}
                      {area.deliveryRadius && (
                        <p className="text-sm text-gray-500 mt-1">Rayon: {area.deliveryRadius} km</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Aucune zone de service définie</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFormFields;

