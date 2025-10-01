import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  Package,
  User,
  ShoppingBag
} from 'lucide-react';
import StarRating from './StarRating';
import CloudinaryImage from '../common/CloudinaryImage';
import { parseProductName } from '../../utils/productUtils';
import { consumerService } from '../../services';

const SimpleReviewForm = ({ 
  product, 
  producer,
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    detailedRating: {
      quality: 0,
      freshness: 0,
      packaging: 0,
      delivery: 0,
      communication: 0,
      valueForMoney: 0
    },
    media: [],
    orderId: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [_loadingOrders, setLoadingOrders] = useState(false);

  // Charger les commandes au montage du composant
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await consumerService.getMyOrders({ 
          status: 'completed',
          limit: 50 
        });
        
        // Gérer différentes structures de réponse
        let ordersData = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            ordersData = response.data;
          } else if (response.data.orders && Array.isArray(response.data.orders)) {
            ordersData = response.data.orders;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            ordersData = response.data.results;
          }
        }
        
        console.log('📦 Commandes chargées:', ordersData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  // Filtrer les commandes qui contiennent ce produit
  const relevantOrders = Array.isArray(orders) && product ? orders.filter(order => 
    order.items && order.items.some(item => 
      item.product && item.product._id === product._id
    )
  ) : [];

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleDetailedRatingChange = (criteria, rating) => {
    setFormData(prev => ({
      ...prev,
      detailedRating: {
        ...prev.detailedRating,
        [criteria]: rating
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    // Ici, vous intégreriez avec Cloudinary pour l'upload
    // Pour l'instant, on simule l'upload
    const newMedia = files.map(file => ({
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file), // URL temporaire
      name: file.name
    }));
    
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }));
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Veuillez donner une note';
    }

    // Vérifier que tous les critères détaillés sont remplis
    const detailedCriteria = ['quality', 'freshness', 'packaging', 'delivery', 'communication', 'valueForMoney'];
    const missingCriteria = detailedCriteria.filter(criteria => formData.detailedRating[criteria] === 0);
    
    if (missingCriteria.length > 0) {
      newErrors.detailedRating = 'Veuillez évaluer tous les critères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        productId: product._id,
        producer: producer._id,
        ...formData
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const criteriaLabels = {
    quality: 'Qualité du produit',
    freshness: 'Fraîcheur',
    packaging: 'Emballage',
    delivery: 'Livraison',
    communication: 'Communication',
    valueForMoney: 'Rapport qualité/prix'
  };

  return (
    <div className="space-y-6">
      {/* Informations sur le produit */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          {product.images?.[0] && (
            <CloudinaryImage
              src={product.images[0].url}
              alt={product.name}
              className="h-16 w-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{parseProductName(product.name)}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Par {producer.firstName} {producer.lastName}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note globale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note globale *
          </label>
          <StarRating
            rating={formData.rating}
            interactive={true}
            onRatingChange={handleRatingChange}
            showText={true}
            size="lg"
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.rating}
            </p>
          )}
        </div>

        {/* Sélection de commande */}
        {relevantOrders.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commande associée (optionnel)
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="no-order"
                  name="orderId"
                  value=""
                  checked={!formData.orderId}
                  onChange={() => setFormData(prev => ({ ...prev, orderId: null }))}
                  className="text-green-600 focus:ring-green-500"
                />
                <label htmlFor="no-order" className="text-sm text-gray-700">
                  Aucune commande spécifique
                </label>
              </div>
              {relevantOrders.map((order) => (
                <div key={order._id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`order-${order._id}`}
                    name="orderId"
                    value={order._id}
                    checked={formData.orderId === order._id}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor={`order-${order._id}`} className="text-sm text-gray-700 flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Commande #{order.orderNumber || order._id.slice(-6)} - 
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')} - 
                    {order.totalAmount} FCFA
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  Aucune commande trouvée pour ce produit
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez quand même laisser un avis général
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Critères détaillés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Évaluation détaillée *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <StarRating
                  rating={formData.detailedRating[key]}
                  interactive={true}
                  onRatingChange={(rating) => handleDetailedRatingChange(key, rating)}
                  size="sm"
                />
              </div>
            ))}
          </div>
          {errors.detailedRating && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.detailedRating}
            </p>
          )}
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre avis
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Partagez votre expérience avec ce produit (optionnel)..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment ? (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.comment}
              </p>
            ) : (
              <div></div>
            )}
            <span className="text-xs text-gray-500">
              {formData.comment.length}/2000
            </span>
          </div>
        </div>

        {/* Médias */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos ou vidéos (optionnel)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center justify-center py-4"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Cliquez pour ajouter des photos ou vidéos
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPG, MP4 jusqu'à 10MB
              </span>
            </label>
          </div>

          {/* Aperçu des médias */}
          {formData.media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.media.map((media, index) => (
                <div key={index} className="relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Aperçu ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600">Vidéo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Publier l'avis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleReviewForm;
