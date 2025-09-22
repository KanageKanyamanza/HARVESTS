import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useTranslation } from 'react-i18next';

// Configuration i18n
import './utils/i18n';

// Providers
import { AuthProvider } from './store/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ModalProvider } from './components/modals/ModalManager';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import UserTypeRedirect from './components/auth/UserTypeRedirect';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy Loading des pages
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Producers = React.lazy(() => import('./pages/Producers'));
const ProducerProfile = React.lazy(() => import('./pages/ProducerProfile'));

// Auth Pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = React.lazy(() => import('./pages/auth/VerifyEmail'));

// Dashboard Pages
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Profile = React.lazy(() => import('./pages/dashboard/Profile'));
const Orders = React.lazy(() => import('./pages/dashboard/Orders'));
const Messages = React.lazy(() => import('./pages/dashboard/Messages'));
const Settings = React.lazy(() => import('./pages/dashboard/Settings'));
const Favorites = React.lazy(() => import('./pages/dashboard/consumer/Favorites'));
const Subscriptions = React.lazy(() => import('./pages/dashboard/consumer/Subscriptions'));
const Reviews = React.lazy(() => import('./pages/dashboard/consumer/Reviews'));
const Loyalty = React.lazy(() => import('./pages/dashboard/consumer/Loyalty'));
const Stats = React.lazy(() => import('./pages/dashboard/consumer/Stats'));

// Producer Dashboard
const ProducerDashboard = React.lazy(() => import('./pages/dashboard/producer/ProducerDashboard'));
const MyProducts = React.lazy(() => import('./pages/dashboard/producer/MyProducts'));
const AddProduct = React.lazy(() => import('./pages/dashboard/producer/AddProduct'));
const EditProduct = React.lazy(() => import('./pages/dashboard/producer/EditProduct'));

// Consumer Dashboard  
const ConsumerDashboard = React.lazy(() => import('./pages/dashboard/consumer/ConsumerDashboard'));
const Cart = React.lazy(() => import('./pages/dashboard/consumer/Cart'));
const Checkout = React.lazy(() => import('./pages/dashboard/consumer/Checkout'));
const OrderHistory = React.lazy(() => import('./pages/dashboard/consumer/OrderHistory'));

// Error Pages
const NotFound = React.lazy(() => import('./pages/errors/NotFound'));
const ServerError = React.lazy(() => import('./pages/errors/ServerError'));
const Unauthorized = React.lazy(() => import('./pages/errors/Unauthorized'));


// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Composant pour les routes protégées
const ProtectedRoute = ({ children, requiredAuth = true, requiredVerification = false }) => {
  const { isAuthenticated, isEmailVerified, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredVerification && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// Composant pour les routes publiques (pas de redirection si connecté)
const PublicRoute = ({ children }) => {
  return children;
};

// Composant pour les routes d'authentification (redirection si déjà connecté)
const AuthRoute = ({ children, useLayout = true }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return useLayout ? <AuthLayout>{children}</AuthLayout> : children;
};

function App() {
  const { i18n } = useTranslation();

  // Mettre à jour l'attribut lang du document
  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <Router>
            <div className="App">
              <UserTypeRedirect>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                {/* Routes publiques */}
                <Route path="/" element={
                  <PublicRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/products" element={
                  <PublicRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/products/:id" element={
                  <PublicRoute>
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/categories" element={
                  <PublicRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/categories/:category" element={
                  <PublicRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/producers" element={
                  <PublicRoute>
                    <Layout>
                      <Producers />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/producers/:id" element={
                  <PublicRoute>
                    <Layout>
                      <ProducerProfile />
                    </Layout>
                  </PublicRoute>
                } />

                {/* Routes d'authentification */}
                <Route path="/login" element={
                  <AuthRoute useLayout={false}>
                    <Login />
                  </AuthRoute>
                } />
                
                <Route path="/register" element={
                  <AuthRoute useLayout={false}>
                    <Register />
                  </AuthRoute>
                } />
                
                <Route path="/forgot-password" element={
                  <AuthRoute>
                    <ForgotPassword />
                  </AuthRoute>
                } />
                
                <Route path="/reset-password/:token" element={
                  <AuthRoute>
                    <ResetPassword />
                  </AuthRoute>
                } />
                
                <Route path="/verify-email/:token?" element={
                  <AuthRoute>
                    <VerifyEmail />
                  </AuthRoute>
                } />

                {/* Routes protégées - Dashboard (sans Layout classique) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* Routes spécifiques Producteur (sans Layout classique) */}
                <Route path="/producer/dashboard" element={
                  <ProtectedRoute>
                    <ProducerDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/products" element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/products/add" element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/products/edit/:id" element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                } />

                {/* Routes spécifiques Consommateur (sans Layout classique) */}
                <Route path="/consumer/dashboard" element={
                  <ProtectedRoute>
                    <ConsumerDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                <Route path="/order-history" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                
                <Route path="/subscriptions" element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                } />
                
                <Route path="/reviews" element={
                  <ProtectedRoute>
                    <Reviews />
                  </ProtectedRoute>
                } />
                
                <Route path="/loyalty" element={
                  <ProtectedRoute>
                    <Loyalty />
                  </ProtectedRoute>
                } />
                
                <Route path="/stats" element={
                  <ProtectedRoute>
                    <Stats />
                  </ProtectedRoute>
                } />

                {/* Routes d'erreur */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/server-error" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </UserTypeRedirect>
          </div>
        </Router>
        </ModalProvider>
      </AuthProvider>
      
      {/* React Query DevTools en développement */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
