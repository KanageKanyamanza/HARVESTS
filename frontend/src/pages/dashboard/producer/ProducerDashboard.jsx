import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import { useOrderNotifications } from '../../../hooks/useOrderNotifications';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import {
  FiPackage,
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
  FiAlertCircle
} from 'react-icons/fi';

const ProducerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { notifyNewOrder } = useOrderNotifications();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersCountRef = useRef(0);
  const isLoadingRef = useRef(false);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('Utilisateur non authentifié, redirection vers la page de connexion');
      navigate('/login');
      return;
    }

    if (user.userType !== 'producer') {
      console.log('Utilisateur n\'est pas un producteur, redirection vers le dashboard approprié');
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      // Vérifier que l'utilisateur est authentifié et est un producteur
      if (!isAuthenticated || !user || user.userType !== 'producer') {
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
        console.log('🔄 Chargement des données du dashboard...');
        
        // Charger les données séquentiellement avec des délais pour éviter la surcharge
        const statsResponse = await producerService.getStats();
        await new Promise(resolve => setTimeout(resolve, 200)); // Délai de 200ms
        
        const productsResponse = await producerService.getProducts({ limit: 5 });
        await new Promise(resolve => setTimeout(resolve, 200)); // Délai de 200ms
        
        const ordersResponse = await producerService.getOrders({ limit: 5 });

          // Debug logs (temporaires)
          // console.log('📊 Stats Response complète:', statsResponse);
          // console.log('📊 Stats Data:', statsResponse.data);
          // console.log('📦 Products Response complète:', productsResponse);
          // console.log('📦 Products Data:', productsResponse.data);
          // console.log('🛒 Orders Response complète:', ordersResponse);
          // console.log('🛒 Orders Data:', ordersResponse.data);

          // Extraire les données correctement selon la structure de l'API
          setStats(statsResponse.data.data?.stats || statsResponse.data.stats || {});
          
          const productsData = productsResponse.data.data?.products || productsResponse.data.products || [];
          setProducts(Array.isArray(productsData) ? productsData : []);
          
          const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
          const newOrders = Array.isArray(ordersData) ? ordersData : [];
          
          // console.log('🛒 Processed Orders:', newOrders);
          // console.log('🛒 Orders Count:', newOrders.length);
          
          // Logs des données finales
          // console.log('📊 Stats finales:', statsResponse.data.data?.stats || statsResponse.data.stats || {});
          // console.log('📦 Products finales:', productsData);
          // console.log('🛒 Orders finales:', newOrders);
          
          setOrders(newOrders);

          // Détecter les nouvelles commandes et créer des notifications
          const previousCount = previousOrdersCountRef.current;
          if (previousCount > 0 && newOrders.length > previousCount) {
            const newOrdersList = newOrders.slice(0, newOrders.length - previousCount);
            newOrdersList.forEach(order => {
              if (order.status === 'pending' || order.status === 'new') {
                notifyNewOrder(order);
              }
            });
          }
          
          // Mettre à jour le compteur
          previousOrdersCountRef.current = newOrders.length;
        } catch (error) {
          console.error('Erreur lors du chargement du dashboard:', error);
          
          // Gestion spécifique des erreurs de rate limiting
          if (error.response?.status === 429) {
            console.warn('Trop de requêtes - Veuillez patienter quelques secondes');
            // Ne pas réessayer automatiquement pour éviter les boucles infinies
            return;
          }
          
          // Gestion des erreurs de connexion réseau
          if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.warn('Erreur de connexion réseau - Vérifiez que le serveur backend est démarré');
            return;
          }
          
          // Pour les autres erreurs, continuer normalement
        } finally {
          setLoading(false);
          isLoadingRef.current = false;
        }
    };

    // Délai initial pour éviter les appels immédiats après l'authentification
    const timeoutId = setTimeout(() => {
      loadDashboardData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user]); // Supprimer notifyNewOrder des dépendances

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Producteur 🌾</h1>
              <p className="text-gray-600 mt-1">Gérez vos produits, commandes et statistiques</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiDollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.reduce((total, order) => total + (order.total || 0), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiStar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageRating || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Produits récents</h2>
                <Link
                  to="/producer/products"
                  className="text-sm text-harvests-green hover:text-green-600 font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="p-6">
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Commencez par ajouter vos premiers produits
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/producer/products/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                    >
                      <FiPlus className="h-4 w-4 mr-2" />
                      Ajouter un produit
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <CloudinaryImage
                              src={product.images[0]?.url || product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              width={200}
                              height={200}
                              quality="auto"
                              crop="fill"
                            />
                          ) : (
                            <FiPackage className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {typeof product.name === 'object' ? (product.name?.fr || product.name?.en || 'Sans nom') : product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.price?.toLocaleString()} FCFA • {product.stock || 0} en stock
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/producer/products/edit/${product._id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiEdit className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/products/${product._id}`}
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

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
                <Link
                  to="/producer/orders"
                  className="text-sm text-harvests-green hover:text-green-600 font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vos commandes apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Commande #{order.orderNumber || order._id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.buyer?.firstName} {order.buyer?.lastName} • {order.total?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/producer/products/add"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <FiPlus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ajouter un produit</h3>
                <p className="text-sm text-gray-500">Créer un nouveau produit</p>
              </div>
            </Link>

            <Link
              to="/producer/products"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Gérer mes produits</h3>
                <p className="text-sm text-gray-500">Voir et modifier mes produits</p>
              </div>
            </Link>

            <Link
              to="/producer/orders"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <FiShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Voir les commandes</h3>
                <p className="text-sm text-gray-500">Gérer les commandes reçues</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProducerDashboard;
