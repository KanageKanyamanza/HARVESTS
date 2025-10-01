import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useNotifications } from '../../../contexts/NotificationContext';
import { consumerService, reviewService } from '../../../services';
import ReviewForm from '../../../components/reviews/ReviewForm';
import { 
  ArrowLeft,
  Package,
  User,
  Calendar,
  CheckCircle
} from 'lucide-react';

const WriteReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await consumerService.getOrderById(orderId);
        const orderData = response.data.order;
        
        if (!orderData) {
          showError('Commande non trouvée');
          navigate('/dashboard/consumer/orders');
          return;
        }

        // Vérifier que la commande est terminée
        if (orderData.status !== 'completed' && orderData.status !== 'delivered') {
          showError('Vous ne pouvez évaluer que les commandes terminées');
          navigate('/dashboard/consumer/orders');
          return;
        }

        // Vérifier qu'un avis n'existe pas déjà
        if (orderData.isReviewed) {
          showError('Vous avez déjà évalué cette commande');
          navigate('/dashboard/consumer/orders');
          return;
        }

        setOrder(orderData);
        
        // Récupérer les détails du produit et du producteur
        if (orderData.items && orderData.items.length > 0) {
          const firstItem = orderData.items[0];
          setProduct(firstItem.product || firstItem.productSnapshot);
          setProducer(orderData.seller || firstItem.producer);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        showError('Erreur lors du chargement de la commande');
        navigate('/dashboard/consumer/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, navigate, showError]);

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      await reviewService.createReview(reviewData);
      showSuccess('Votre avis a été publié avec succès !');
      navigate('/dashboard/consumer/orders');
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      showError('Erreur lors de la publication de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/consumer/orders');
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (!order || !product || !producer) {
    return (
      <ModularDashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Commande non trouvée
            </h2>
            <p className="text-gray-600 mb-4">
              Impossible de charger les informations de la commande.
            </p>
            <button
              onClick={() => navigate('/dashboard/consumer/orders')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux commandes
            </button>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/consumer/orders')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Évaluer votre commande
          </h1>
          <p className="text-gray-600">
            Partagez votre expérience avec ce produit
          </p>
        </div>

        {/* Informations de la commande */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Commande terminée</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Commande #{order.orderNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Terminée le {new Date(order.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Vendeur: {producer.firstName} {producer.lastName}</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'avis */}
        <ReviewForm
          order={order}
          product={product}
          producer={producer}
          onSubmit={handleSubmitReview}
          onCancel={handleCancel}
          loading={submitting}
        />
      </div>
    </ModularDashboardLayout>
  );
};

export default WriteReview;
