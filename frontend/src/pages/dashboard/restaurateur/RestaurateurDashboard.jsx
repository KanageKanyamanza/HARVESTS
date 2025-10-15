import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { restaurateurService } from '../../../services';
import { useOrderNotifications } from '../../../hooks/useOrderNotifications';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import ReviewStats from '../../../components/dashboard/ReviewStats';
import {
  FiShoppingCart,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiEdit,
  FiPlus,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiTruck,
  FiAlertCircle,
  FiClock,
  FiMapPin,
  FiCoffee,
  FiPackage
} from 'react-icons/fi';

const RestaurateurDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { notifyNewOrder } = useOrderNotifications();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersCountRef = useRef(0);
  const isLoadingRef = useRef(false);
  // Supprimé la vérification d'email - pas nécessaire comme chez le transformateur

  // Fonction pour calculer les dépenses du mois en cours
  const calculateMonthlySpending = useCallback((orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return orders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt || order.updatedAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      // Vérifier si la commande est du mois en cours et qu'elle est livrée/terminée
      if (orderMonth === currentMonth && orderYear === currentYear && 
          (order.status === 'delivered' || order.status === 'completed')) {
        return total + (order.totalAmount || 0);
      }
      return total;
    }, 0);
  }, []);

  // Fonction pour calculer les commandes du mois en cours
  const calculateMonthlyOrders = useCallback((orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.updatedAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      return orderMonth === currentMonth && orderYear === currentYear;
    }).length;
  }, []);

  // Mémoriser les calculs pour éviter les recalculs inutiles
  const monthlySpending = useMemo(() => calculateMonthlySpending(orders), [orders, calculateMonthlySpending]);
  const monthlyOrders = useMemo(() => calculateMonthlyOrders(orders), [orders, calculateMonthlyOrders]);

  // Mémoriser les données pour éviter les re-renders
  const memoizedOrders = useMemo(() => orders, [orders]);
  const memoizedSuppliers = useMemo(() => suppliers, [suppliers]);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('Utilisateur non authentifié, redirection vers la page de connexion');
      navigate('/login');
      return;
    }

    if (user.userType !== 'restaurateur') {
      console.log('Utilisateur n\'est pas un restaurateur, redirection vers le dashboard approprié');
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fonction pour charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    // Vérifier que l'utilisateur est authentifié et est un restaurateur
    if (!isAuthenticated || !user || user.userType !== 'restaurateur') {
      return;
    }

    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('Chargement déjà en cours, ignoré');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      console.log('🔄 Chargement des données du dashboard restaurateur...');
      
      // Charger les données en parallèle pour de meilleures performances
      const [statsResponse, ordersResponse, suppliersResponse] = await Promise.all([
        restaurateurService.getStats(),
        restaurateurService.getOrders({ limit: 5 }),
        restaurateurService.getPreferredSuppliers({ limit: 5 })
      ]);

      // Extraire les données correctement selon la structure de l'API
      setStats(statsResponse.data.data?.stats || statsResponse.data.stats || {});
      
      const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
      const newOrders = Array.isArray(ordersData) ? ordersData : [];
      setOrders(newOrders);
      
      const suppliersData = suppliersResponse.data.data?.suppliers || suppliersResponse.data.suppliers || [];
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

      // Mettre à jour le compteur
      previousOrdersCountRef.current = newOrders.length;
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      
      // Gestion spécifique des erreurs de rate limiting
      if (error.response?.status === 429) {
        console.warn('Trop de requêtes - Veuillez patienter quelques secondes');
        return;
      }
      
      // Gestion des erreurs de connexion réseau
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Erreur de connexion réseau - Vérifiez que le serveur backend est démarré');
        return;
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, user]);

  // Fonction séparée pour gérer les notifications de nouvelles commandes
  const handleNewOrderNotifications = useCallback((newOrders) => {
    const previousCount = previousOrdersCountRef.current;
    if (previousCount > 0 && newOrders.length > previousCount) {
      const newOrdersList = newOrders.slice(0, newOrders.length - previousCount);
      newOrdersList.forEach(order => {
        if (order.status === 'pending' || order.status === 'new') {
          notifyNewOrder(order);
        }
      });
    }
  }, [notifyNewOrder]);

  // Charger les données du dashboard
  useEffect(() => {
    // Délai initial pour éviter les appels immédiats après l'authentification
    const timeoutId = setTimeout(() => {
      loadDashboardData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [loadDashboardData]);

  // Gérer les notifications de nouvelles commandes quand les commandes changent
  useEffect(() => {
    if (orders.length > 0) {
      handleNewOrderNotifications(orders);
    }
  }, [orders, handleNewOrderNotifications]);

  // Pas de vérification d'email nécessaire - approche simple comme le transformateur

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
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
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Message d'information pour email non vérifié */}
        {/* Pas de message de vérification d'email - approche simple comme le transformateur */}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Restaurateur 🍽️</h1>
              <p className="text-gray-600 mt-1">Gérez vos commandes, fournisseurs et statistiques</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dépenses ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlySpending.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fournisseurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memoizedSuppliers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiStar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.supplierRating || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
                <Link
                  to="/restaurateur/orders"
                  className="text-sm text-harvests-green hover:text-green-600 font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="p-6">
              {memoizedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vos commandes apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memoizedOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Commande #{order.orderNumber || order._id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.seller?.firstName} {order.seller?.lastName} • {order.totalAmount?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'delivered' ? 'Livrée' :
                           order.status === 'in-transit' ? 'En transit' :
                           order.status === 'pending' ? 'En attente' :
                           'Annulée'}
                        </span>
                        <Link
                          to={`/orders/${order._id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preferred Suppliers */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Fournisseurs préférés</h2>
                <Link
                  to="/restaurateur/suppliers"
                  className="text-sm text-harvests-green hover:text-green-600 font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="p-6">
              {memoizedSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun fournisseur</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Découvrez des fournisseurs de qualité
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/restaurateur/suppliers/discover"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                    >
                      <FiPlus className="h-4 w-4 mr-2" />
                      Découvrir des fournisseurs
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {memoizedSuppliers.map((supplier) => (
                    <div key={supplier._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {supplier.avatar ? (
                            <CloudinaryImage
                              src={supplier.avatar}
                              alt={supplier.firstName}
                              className="w-12 h-12 object-cover rounded-lg"
                              width={200}
                              height={200}
                              quality="auto"
                              crop="fill"
                            />
                          ) : (
                            <FiUsers className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {supplier.firstName} {supplier.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {supplier.userType === 'producer' ? 'Producteur' : 
                             supplier.userType === 'transformer' ? 'Transformateur' : 
                             supplier.userType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {supplier.rating || 'N/A'}
                          </span>
                        </div>
                        <Link
                          to={supplier.userType === 'producer' 
                            ? `/producers/${supplier._id}` 
                            : `/transformers/${supplier._id}`
                          }
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Stats */}
        <div className="mt-8">
          <ReviewStats 
            userId={user?._id} 
            userType="restaurateur" 
            showDetailed={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/restaurateur/orders/new"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <FiPlus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Nouvelle commande</h3>
                <p className="text-sm text-gray-500">Passer une commande</p>
              </div>
            </Link>

            <Link
              to="/restaurateur/suppliers"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Fournisseurs</h3>
                <p className="text-sm text-gray-500">Gérer mes fournisseurs</p>
              </div>
            </Link>

            <Link
              to="/restaurateur/orders"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <FiShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mes commandes</h3>
                <p className="text-sm text-gray-500">Voir toutes les commandes</p>
              </div>
            </Link>

            <Link
              to="/restaurateur/profile"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <FiEdit className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-500">Modifier mes informations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default RestaurateurDashboard;
