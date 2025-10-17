import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiPackage,
  FiTarget
} from 'react-icons/fi';

const NewBatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batchNumber: '',
    productType: '',
    description: '',
    inputMaterials: [],
    expectedOutput: {
      quantity: '',
      unit: 'kg',
      quality: 'standard'
    },
    processingSteps: [],
    estimatedDuration: '',
    priority: 'medium',
    qualityTargets: {
      minQuality: 4.0,
      maxDefects: 5,
      temperature: '',
      humidity: ''
    },
    specialInstructions: ''
  });

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    supplier: '',
    quality: 'standard'
  });

  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    duration: '',
    temperature: '',
    equipment: ''
  });

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const units = ['kg', 'g', 'L', 'mL', 'pièces', 'sacs', 'bouteilles', 'pots', 'tonnes'];

  const qualityLevels = [
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'organic', label: 'Bio' },
    { value: 'artisanal', label: 'Artisanal' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpectedOutputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      expectedOutput: {
        ...prev.expectedOutput,
        [name]: value
      }
    }));
  };

  const handleQualityTargetsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      qualityTargets: {
        ...prev.qualityTargets,
        [name]: value
      }
    }));
  };

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.quantity) {
      setFormData(prev => ({
        ...prev,
        inputMaterials: [...prev.inputMaterials, { ...newMaterial, id: Date.now() }]
      }));
      setNewMaterial({ name: '', quantity: '', unit: 'kg', supplier: '', quality: 'standard' });
    }
  };

  const removeMaterial = (id) => {
    setFormData(prev => ({
      ...prev,
      inputMaterials: prev.inputMaterials.filter(material => material.id !== id)
    }));
  };

  const addStep = () => {
    if (newStep.name && newStep.description) {
      setFormData(prev => ({
        ...prev,
        processingSteps: [...prev.processingSteps, { ...newStep, id: Date.now() }]
      }));
      setNewStep({ name: '', description: '', duration: '', temperature: '', equipment: '' });
    }
  };

  const removeStep = (id) => {
    setFormData(prev => ({
      ...prev,
      processingSteps: prev.processingSteps.filter(step => step.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler la création du lot
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers la liste des lots
      navigate('/transformer/production/batches');
    } catch (error) {
      console.error('Erreur lors de la création du lot:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau Lot de Production</h1>
            <p className="text-gray-600 mt-1">Créer un nouveau lot de production</p>
          </div>
          <button
            onClick={() => navigate('/transformer/production/batches')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
          >
            <FiX className="h-4 w-4 mr-2" />
            Annuler
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro du lot *
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="B-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de produit *
                </label>
                <input
                  type="text"
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Confiture de mangue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Décrivez le processus de transformation..."
              />
            </div>
          </div>

          {/* Matières premières */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Matières Premières</h2>
            
            {/* Ajouter une matière */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Mangues"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={newMaterial.supplier}
                  onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Fournisseur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualité
                </label>
                <select
                  value={newMaterial.quality}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {qualityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addMaterial}
                  className="w-full px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FiPlus className="h-4 w-4 mr-2 inline" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Liste des matières */}
            {formData.inputMaterials.length > 0 && (
              <div className="space-y-2">
                {formData.inputMaterials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-harvests-light rounded-md">
                    <div className="flex items-center space-x-4">
                      <FiPackage className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{material.name}</span>
                      <span className="text-gray-600">{material.quantity} {material.unit}</span>
                      <span className="text-sm text-gray-500">({material.quality})</span>
                      {material.supplier && (
                        <span className="text-sm text-gray-500">- {material.supplier}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produit de sortie attendu */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Produit de Sortie Attendu</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité attendue *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.expectedOutput.quantity}
                  onChange={handleExpectedOutputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité *
                </label>
                <select
                  name="unit"
                  value={formData.expectedOutput.unit}
                  onChange={handleExpectedOutputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualité cible
                </label>
                <select
                  name="quality"
                  value={formData.expectedOutput.quality}
                  onChange={handleExpectedOutputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {qualityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 2 jours"
                />
              </div>
            </div>
          </div>

          {/* Étapes de transformation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Étapes de Transformation</h2>
            
            {/* Ajouter une étape */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'étape
                </label>
                <input
                  type="text"
                  value={newStep.name}
                  onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Cuisson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newStep.description}
                  onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Description de l'étape"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={newStep.duration}
                  onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 30 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Température
                </label>
                <input
                  type="text"
                  value={newStep.temperature}
                  onChange={(e) => setNewStep({ ...newStep, temperature: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 80°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement
                </label>
                <input
                  type="text"
                  value={newStep.equipment}
                  onChange={(e) => setNewStep({ ...newStep, equipment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Cuiseur"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addStep}
                  className="w-full px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FiPlus className="h-4 w-4 mr-2 inline" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Liste des étapes */}
            {formData.processingSteps.length > 0 && (
              <div className="space-y-2">
                {formData.processingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-3 bg-harvests-light rounded-md">
                    <div className="flex items-center space-x-4">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {index + 1}
                      </span>
                      <span className="font-medium">{step.name}</span>
                      <span className="text-gray-600">{step.description}</span>
                      {step.duration && (
                        <span className="text-sm text-gray-500">({step.duration})</span>
                      )}
                      {step.temperature && (
                        <span className="text-sm text-gray-500">- {step.temperature}</span>
                      )}
                      {step.equipment && (
                        <span className="text-sm text-gray-500">- {step.equipment}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objectifs de qualité */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Objectifs de Qualité</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualité minimale
                </label>
                <input
                  type="number"
                  name="minQuality"
                  value={formData.qualityTargets.minQuality}
                  onChange={handleQualityTargetsChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Défauts max (%)
                </label>
                <input
                  type="number"
                  name="maxDefects"
                  value={formData.qualityTargets.maxDefects}
                  onChange={handleQualityTargetsChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Température
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.qualityTargets.temperature}
                  onChange={handleQualityTargetsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 18-22°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Humidité
                </label>
                <input
                  type="text"
                  name="humidity"
                  value={formData.qualityTargets.humidity}
                  onChange={handleQualityTargetsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 60-70%"
                />
              </div>
            </div>
          </div>

          {/* Instructions spéciales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Instructions Spéciales</h2>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Instructions particulières, contraintes, exigences spéciales..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transformer/production/batches')}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Créer le lot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default NewBatch;
