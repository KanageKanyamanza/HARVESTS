/**
 * Composant principal pour gérer toutes les routes de l'application
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import des routes organisées
import { 
  adminRoutes,
  consumerRoutes,
  producerRoutes,
  transformerRoutes,
  restaurateurRoutes,
  transporterRoutes,
  exporterRoutes,
  explorerRoutes
} from './routes';

// Import des pages publiques
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import DishDetail from '../pages/DishDetail';
import Categories from '../pages/Categories';
import Producers from '../pages/Producers';
import ProducerProfile from '../pages/ProducerProfile';
import Vendeurs from '../pages/Vendeurs';
import Transformers from '../pages/Transformers';
import TransformerProfile from '../pages/TransformerProfile';
import PublicRestaurateurProfile from '../pages/RestaurateurProfile';
import TransporterProfile from '../pages/TransporterProfile';
import ExporterProfile from '../pages/ExporterProfile';
import TransporteursExportateurs from '../pages/TransporteursExportateurs';
import CartPage from '../pages/Cart';
import Contact from '../pages/Contact';
import LoyaltyProgram from '../pages/LoyaltyProgram';

// Import des pages d'authentification
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import EmailVerification from '../pages/auth/EmailVerification';
import ResetPassword from '../pages/auth/ResetPassword';

// Import des layouts
import Layout from '../components/layout/Layout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ModularDashboardLayout from '../components/layout/ModularDashboardLayout';
import UserTypeRedirect from '../components/auth/UserTypeRedirect';

// Import du NavigationManager
import { generateSidebarNavigation } from './NavigationManager';

// Import des icônes
import { 
  FiHome, 
  FiShoppingBag, 
  FiPackage, 
  FiStar, 
  FiUser, 
  FiSettings 
} from 'react-icons/fi';
import { FaChartBar } from 'react-icons/fa';

// Composant de fallback pour les routes
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-harvests-light">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// Composant wrapper pour les routes avec ModularDashboardLayout
const DashboardRouteWrapper = ({ children }) => {
  const { user } = useAuth();
  const navigationItems = generateSidebarNavigation(user, {
    // Icons pour la navigation
    FiHome,
    FiShoppingBag,
    FiPackage,
    FiStar,
    FiUser,
    FiSettings,
    FaChartBar
  });

  return (
    <ModularDashboardLayout navigationItems={navigationItems} user={user}>
      {children}
    </ModularDashboardLayout>
  );
};

/**
 * Composant pour wrapper les routes avec Suspense
 */
const SuspenseRoute = ({ element }) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

/**
 * Composant pour les routes protégées
 */
const ProtectedRoute = ({ children, requiredRole, requiredUserType }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Composant pour les routes publiques (redirection si connecté)
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Composant principal des routes
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Layout><SuspenseRoute element={<Home />} /></Layout>} />
      <Route path="/products" element={<Layout><SuspenseRoute element={<Products />} /></Layout>} />
      <Route path="/products/:id" element={<Layout><SuspenseRoute element={<ProductDetail />} /></Layout>} />
      <Route path="/dishes/:id" element={<Layout><SuspenseRoute element={<DishDetail />} /></Layout>} />
      <Route path="/categories" element={<Layout><SuspenseRoute element={<Categories />} /></Layout>} />
      <Route path="/categories/:category" element={<Layout><SuspenseRoute element={<Products />} /></Layout>} />
      <Route path="/producers" element={<Layout><SuspenseRoute element={<Producers />} /></Layout>} />
      <Route path="/producers/:id" element={<Layout><SuspenseRoute element={<ProducerProfile />} /></Layout>} />
      <Route path="/vendeurs" element={<Layout><SuspenseRoute element={<Vendeurs />} /></Layout>} />
      <Route path="/transformers" element={<Layout><SuspenseRoute element={<Transformers />} /></Layout>} />
      <Route path="/transformers/:id" element={<Layout><SuspenseRoute element={<TransformerProfile />} /></Layout>} />
      <Route path="/restaurateurs/:id" element={<Layout><SuspenseRoute element={<PublicRestaurateurProfile />} /></Layout>} />
      <Route path="/logistics" element={<Layout><SuspenseRoute element={<TransporteursExportateurs />} /></Layout>} />
      <Route path="/transporters/:id" element={<Layout><SuspenseRoute element={<TransporterProfile />} /></Layout>} />
      <Route path="/exporters/:id" element={<Layout><SuspenseRoute element={<ExporterProfile />} /></Layout>} />
      <Route path="/cart" element={<Layout><SuspenseRoute element={<CartPage />} /></Layout>} />
      <Route path="/contact" element={<Layout><SuspenseRoute element={<Contact />} /></Layout>} />
      <Route path="/loyalty" element={<Layout><SuspenseRoute element={<LoyaltyProgram />} /></Layout>} />

      {/* Routes d'authentification */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout><SuspenseRoute element={<Login />} /></AuthLayout>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout><SuspenseRoute element={<Register />} /></AuthLayout>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <AuthLayout><SuspenseRoute element={<ForgotPassword />} /></AuthLayout>
        </PublicRoute>
      } />
      <Route path="/email-verification" element={
        <PublicRoute>
          <AuthLayout><SuspenseRoute element={<EmailVerification />} /></AuthLayout>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <AuthLayout><SuspenseRoute element={<ResetPassword />} /></AuthLayout>
        </PublicRoute>
      } />

      {/* Routes admin */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <SuspenseRoute element={route.element} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes consumer */}
      {consumerRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="consumer">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes producer */}
      {producerRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="producer">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes transformer */}
      {transformerRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="transformer">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes restaurateur */}
      {restaurateurRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="restaurateur">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes transporter */}
      {transporterRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="transporter">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes exporter */}
      {exporterRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="exporter">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Routes explorer */}
      {explorerRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredUserType="explorer">
              <DashboardRouteWrapper>
                <SuspenseRoute element={route.element} />
              </DashboardRouteWrapper>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Route de redirection pour le dashboard */}
      <Route path="/dashboard" element={<UserTypeRedirect />} />

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
