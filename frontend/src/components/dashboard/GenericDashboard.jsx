import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import ModularDashboardLayout from '../layout/ModularDashboardLayout';
import CommonStats from '../common/CommonStats';
import {
  FiAlertCircle,
} from 'react-icons/fi';

const GenericDashboard = ({ 
  userType, 
  service, 
  title, 
  description, 
  icon,
  statsConfig,
  sections = [],
  loading: externalLoading
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { notifyNewOrder } = useOrderNotifications();
  
  // États communs
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const previousOrdersCountRef = useRef(0);
  const isLoadingRef = useRef(false);

  // Fonction pour calculer les revenus du mois en cours
  const calculateMonthlyRevenue = useCallback((orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear &&
               order.status === 'completed';
      })
      .reduce((total, order) => total + (order.total || order.totalAmount || 0), 0);
  }, [userType]);

  // Fonction pour charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      console.log('🔄 Chargement des données du dashboard...');
      
      // Pour les consommateurs, ne pas charger les produits
      const promises = [
        service.getStats().catch(err => {
          console.warn('Erreur lors du chargement des stats:', err);
          if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
            setEmailVerificationRequired(true);
          }
          return { data: { stats: {} } };
        }),
        service.getOrders({ limit: 5 }).catch(err => {
          console.warn('Erreur lors du chargement des commandes:', err);
          if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
            setEmailVerificationRequired(true);
          }
          return { data: { orders: [] } };
        })
      ];

      // Ajouter le chargement des produits seulement si ce n'est pas un consommateur
      if (userType !== 'consumer') {
        promises.splice(1, 0, service.getProducts({ limit: 5 }).catch(err => {
          console.warn('Erreur lors du chargement des produits:', err);
          if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
            setEmailVerificationRequired(true);
          }
          return { data: { products: [] } };
        }));
      }

      const responses = await Promise.all(promises);
      
      // Extraire les réponses selon le type d'utilisateur
      let statsResponse, productsResponse, ordersResponse;
      
      if (userType === 'consumer') {
        [statsResponse, ordersResponse] = responses;
        productsResponse = { data: { products: [] } }; // Pas de produits pour les consommateurs
      } else {
        [statsResponse, productsResponse, ordersResponse] = responses;
      }

      // Extraire les données correctement selon la structure de l'API
      setStats(statsResponse.data.data?.stats || statsResponse.data.stats || {});
      
      const productsData = productsResponse.data.data?.products || productsResponse.data.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Vérifier les nouvelles commandes
      const currentOrdersCount = ordersData.length;
      if (currentOrdersCount > previousOrdersCountRef.current && previousOrdersCountRef.current > 0) {
        const newOrdersCount = currentOrdersCount - previousOrdersCountRef.current;
        notifyNewOrder(newOrdersCount);
      }
      previousOrdersCountRef.current = currentOrdersCount;

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [service, notifyNewOrder]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthenticated && user) {
      // Délai pour éviter les appels simultanés
      const timeoutId = setTimeout(() => {
        loadDashboardData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user]);

  // Recharger les données toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && user && !isLoadingRef.current) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Calculer les revenus du mois
  const monthlyRevenue = useMemo(() => {
    return calculateMonthlyRevenue(orders);
  }, [orders, calculateMonthlyRevenue]);

  // Configuration des statistiques selon le type d'utilisateur
  const getStatsConfig = () => {
    // Si un statsConfig est fourni, l'utiliser directement
    if (statsConfig) {
      const baseConfig = {
        monthlyRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        averageRating: stats?.averageRating || 0,
        totalReviews: stats?.totalReviews || 0
      };

      return statsConfig(baseConfig);
    }

    // Sinon, utiliser la configuration par défaut
    return {
      monthlyRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      averageRating: stats?.averageRating || 0,
      totalReviews: stats?.totalReviews || 0
    };
  };

  if (!isAuthenticated || !user) {
    return (
      <ModularDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  // Combiner le loading externe et interne
  const isLoading = loading || externalLoading;

  if (isLoading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Alerte de vérification d'email */}
        {emailVerificationRequired && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Vérification d'email requise
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Pour accéder à toutes les fonctionnalités du dashboard, veuillez vérifier votre adresse email.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => navigate('/verify-email')}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Vérifier mon email maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {icon && <span className="mr-3">{icon}</span>}
                {title}
              </h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
            {/* <div className="flex space-x-3">
              <Link
                to="/dashboard/profile"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <FiEdit className="mr-2" />
                Mon profil
              </Link>
              <Link
                to="/dashboard/settings"
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <FiEdit className="mr-2" />
                Paramètres
              </Link>
            </div> */}
          </div>
        </div>

        {/* Statistiques communes */}
        <div className="mb-8">
          <CommonStats 
            stats={getStatsConfig()} 
            userType={userType} 
            loading={isLoading}
          />
        </div>

        {/* Sections personnalisées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow p-4 ${
                section.fullWidth ? 'w-full' : 'w-full'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  {section.icon && <span className="mr-2">{section.icon}</span>}
                  {section.title}
                </h3>
                {section.action && (
                  <Link
                    to={section.action.to}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {section.action.text}
                  </Link>
                )}
              </div>
              {React.cloneElement(section.content, {
                products,
                userType,
                loading: isLoading,
                orders,
                stats
              })}
            </div>
          ))}
        </div>

      </div>
    </ModularDashboardLayout>
  );
};

export default GenericDashboard;
