import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useTranslation } from 'react-i18next';

// Configuration i18n
import './utils/i18n';

// Providers
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { ModalProvider } from './components/modals/ModalManager';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/common/ScrollToTop';
import UserTypeRedirect from './components/auth/UserTypeRedirect';

// Loading Component
import NotificationContainer from './components/common/NotificationContainer';

// Composant de fallback pour les routes
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// Lazy Loading des pages
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Producers = React.lazy(() => import('./pages/Producers'));
const ProducerProfile = React.lazy(() => import('./pages/ProducerProfile'));
const Vendeurs = React.lazy(() => import('./pages/Vendeurs'));
const Transformers = React.lazy(() => import('./pages/Transformers'));
const TransformerProfile = React.lazy(() => import('./pages/TransformerProfile'));
const PublicRestaurateurProfile = React.lazy(() => import('./pages/RestaurateurProfile'));
const CartPage = React.lazy(() => import('./pages/Cart'));
const LoyaltyProgram = React.lazy(() => import('./pages/LoyaltyProgram'));

// Auth Pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const EmailVerification = React.lazy(() => import('./pages/auth/EmailVerification'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));

// Dashboard Pages
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));

// Consumer Dashboard
const ProfileConsumer = React.lazy(() => import('./pages/dashboard/consumer/ProfileConsumer'));
const SettingsConsumer = React.lazy(() => import('./pages/dashboard/consumer/SettingsConsumer'));
const Favorites = React.lazy(() => import('./pages/dashboard/consumer/Favorites'));
const Subscriptions = React.lazy(() => import('./pages/dashboard/consumer/Subscriptions'));
const Reviews = React.lazy(() => import('./pages/dashboard/consumer/Reviews'));
const WriteReview = React.lazy(() => import('./pages/dashboard/consumer/WriteReview'));
const Loyalty = React.lazy(() => import('./pages/dashboard/consumer/Loyalty'));
const Stats = React.lazy(() => import('./pages/dashboard/consumer/Stats'));

// Producer Dashboard
const ProfileProducer = React.lazy(() => import('./pages/dashboard/producer/ProfileProducer'));
const SettingsProducer = React.lazy(() => import('./pages/dashboard/producer/SettingsProducer'));
const ProducerDashboard = React.lazy(() => import('./pages/dashboard/producer/ProducerDashboard'));
const MyProducts = React.lazy(() => import('./pages/dashboard/producer/MyProducts'));
const AddProduct = React.lazy(() => import('./pages/dashboard/producer/AddProduct'));
const EditProduct = React.lazy(() => import('./pages/dashboard/producer/EditProduct'));
const ProducerOrders = React.lazy(() => import('./pages/dashboard/producer/Orders'));
const ProducerReviews = React.lazy(() => import('./pages/dashboard/producer/ProducerReviews'));
const ProducerStats = React.lazy(() => import('./pages/dashboard/producer/Stats'));
const Certifications = React.lazy(() => import('./pages/dashboard/producer/Certifications'));
const Transporters = React.lazy(() => import('./pages/dashboard/producer/Transporters'));
const Documents = React.lazy(() => import('./pages/dashboard/producer/Documents'));

// Transformer Dashboard
const TransformerDashboard = React.lazy(() => import('./pages/dashboard/transformer/TransformerDashboard'));

// Transformer Pages
const OrdersList = React.lazy(() => import('./pages/dashboard/transformer/orders/OrdersList'));
const TransformerProducts = React.lazy(() => import('./pages/dashboard/transformer/products/MyProducts'));
const NewProduct = React.lazy(() => import('./pages/dashboard/transformer/products/NewProduct'));
const CertificationsList = React.lazy(() => import('./pages/dashboard/transformer/certifications/CertificationsList'));
const BusinessAnalytics = React.lazy(() => import('./pages/dashboard/transformer/analytics/BusinessAnalytics'));
const ProfileSettings = React.lazy(() => import('./pages/dashboard/transformer/ProfileTransformer'));
const Settings = React.lazy(() => import('./pages/dashboard/transformer/SettingsTransformer'));
const ShopManagement = React.lazy(() => import('./pages/dashboard/transformer/shop/ShopManagement'));

// Restaurateur Dashboard
const RestaurateurDashboard = React.lazy(() => import('./pages/dashboard/restaurateur/RestaurateurDashboard'));
const RestaurateurOrders = React.lazy(() => import('./pages/dashboard/restaurateur/OrdersList'));
const RestaurateurSuppliers = React.lazy(() => import('./pages/dashboard/restaurateur/SuppliersList'));
const RestaurateurProfile = React.lazy(() => import('./pages/dashboard/restaurateur/ProfileRestaurateur'));
const RestaurateurNewOrder = React.lazy(() => import('./pages/dashboard/restaurateur/NewOrder'));
const RestaurateurDishes = React.lazy(() => import('./pages/dashboard/restaurateur/DishesManagement'));

// Consumer Dashboard  
const ConsumerDashboard = React.lazy(() => import('./pages/dashboard/consumer/ConsumerDashboard'));
const Cart = React.lazy(() => import('./pages/dashboard/consumer/Cart'));
const Checkout = React.lazy(() => import('./pages/dashboard/consumer/Checkout'));
const OrderHistory = React.lazy(() => import('./pages/dashboard/consumer/OrderHistory'));
const OrderDetail = React.lazy(() => import('./pages/orders/OrderDetail'));
const OrderConfirmation = React.lazy(() => import('./pages/dashboard/consumer/OrderConfirmation'));

// Admin Dashboard
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminManagement = React.lazy(() => import('./pages/admin/AdminManagement'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const UserDetails = React.lazy(() => import('./pages/admin/UserDetails'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const ProductDetails = React.lazy(() => import('./pages/admin/ProductDetails'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const OrderDetails = React.lazy(() => import('./pages/admin/OrderDetails'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));

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
  const { isAuthenticated, isEmailVerified } = useAuth();

  // Ne plus afficher de loader global - laisser les pages gérer leur propre état

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
  const { isAuthenticated } = useAuth();

  // Ne plus afficher de loader global - laisser les pages gérer leur propre état

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
        <NotificationProvider>
          <CartProvider>
            <ModalProvider>
              <Router>
                <ScrollToTop />
                <div className="App">
                  <UserTypeRedirect>
                    <Suspense fallback={<RouteFallback />}>
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
                
                <Route path="/cart" element={
                  <PublicRoute>
                    <Layout>
                      <CartPage />
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

                {/* Page Vendeurs (Producteurs + Transformateurs) */}
                <Route path="/vendeurs" element={
                  <PublicRoute>
                    <Layout>
                      <Vendeurs />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/transformers" element={
                  <PublicRoute>
                    <Layout>
                      <Transformers />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/transformers/:id" element={
                  <PublicRoute>
                    <Layout>
                      <TransformerProfile />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/restaurateurs/:id" element={
                  <PublicRoute>
                    <Layout>
                      <PublicRestaurateurProfile />
                    </Layout>
                  </PublicRoute>
                } />
                
                <Route path="/loyalty" element={
                  <PublicRoute>
                    <Layout>
                      <LoyaltyProgram />
                    </Layout>
                  </PublicRoute>
                } />

                {/* Routes d'authentification */}
                <Route path="/login" element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                } />
                
                <Route path="/register" element={
                  <AuthRoute>
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
                    <EmailVerification />
                  </AuthRoute>
                } />

                {/* Routes protégées - Dashboard (sans Layout classique) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                

                {/* Routes spécifiques Consommateur */}
                <Route path="/consumer/profile" element={
                  <ProtectedRoute>
                    <ProfileConsumer />
                  </ProtectedRoute>
                } />
                
                <Route path="/consumer/settings" element={
                  <ProtectedRoute>
                    <SettingsConsumer />
                  </ProtectedRoute>
                } />

                {/* Routes spécifiques Producteur */}
                <Route path="/producer/profile" element={
                  <ProtectedRoute>
                    <ProfileProducer />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/settings" element={
                  <ProtectedRoute>
                    <SettingsProducer />
                  </ProtectedRoute>
                } />

                <Route path="/producer/dashboard" element={
                  <ProtectedRoute>
                    <ProducerDashboard />
                  </ProtectedRoute>
                } />

                {/* Transformer Dashboard Routes */}
                <Route path="/transformer/dashboard" element={
                  <ProtectedRoute>
                    <TransformerDashboard />
                  </ProtectedRoute>
                } />

                {/* Transformer Orders Routes */}
                <Route path="/transformer/orders" element={
                  <ProtectedRoute>
                    <OrdersList />
                  </ProtectedRoute>
                } />
                

                <Route path="/transformer/orders/:orderId" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />

                {/* Transformer Products Routes */}
                <Route path="/transformer/products" element={
                  <ProtectedRoute>
                    <TransformerProducts />
                  </ProtectedRoute>
                } />

                <Route path="/transformer/products/new" element={
                  <ProtectedRoute>
                    <NewProduct />
                  </ProtectedRoute>
                } />

                {/* Transformer Quotes Routes */}

                {/* Transformer Certifications Routes */}
                <Route path="/transformer/certifications" element={
                  <ProtectedRoute>
                    <CertificationsList />
                  </ProtectedRoute>
                } />

                {/* Transformer Analytics Routes */}
                <Route path="/transformer/analytics/business" element={
                  <ProtectedRoute>
                    <BusinessAnalytics />
                  </ProtectedRoute>
                } />

                {/* Transformer Settings Routes */}
                <Route path="/transformer/profile" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />

                {/* Transformer Quality Control Routes */}

         {/* Transformer Settings Routes */}
         <Route path="/transformer/settings" element={
           <ProtectedRoute>
             <Settings />
           </ProtectedRoute>
         } />

         {/* Transformer Shop Routes */}
         <Route path="/transformer/shop" element={
           <ProtectedRoute>
             <ShopManagement />
           </ProtectedRoute>
         } />

         {/* Restaurateur Dashboard Routes */}
         <Route path="/restaurateur/dashboard" element={
           <ProtectedRoute>
             <RestaurateurDashboard />
           </ProtectedRoute>
         } />

         {/* Restaurateur Orders Routes */}
         <Route path="/restaurateur/orders" element={
           <ProtectedRoute>
             <RestaurateurOrders />
           </ProtectedRoute>
         } />

         <Route path="/restaurateur/orders/new" element={
           <ProtectedRoute>
             <RestaurateurNewOrder />
           </ProtectedRoute>
         } />

         <Route path="/restaurateur/orders/:orderId" element={
           <ProtectedRoute>
             <OrderDetail />
           </ProtectedRoute>
         } />

         {/* Restaurateur Suppliers Routes */}
         <Route path="/restaurateur/suppliers" element={
           <ProtectedRoute>
             <RestaurateurSuppliers />
           </ProtectedRoute>
         } />

         <Route path="/restaurateur/suppliers/:supplierId" element={
           <ProtectedRoute>
             <ProducerProfile />
           </ProtectedRoute>
         } />

         {/* Restaurateur Profile Routes */}
         <Route path="/restaurateur/profile" element={
           <ProtectedRoute>
             <RestaurateurProfile />
           </ProtectedRoute>
         } />

         <Route path="/restaurateur/dishes" element={
           <ProtectedRoute>
             <RestaurateurDishes />
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
                
                <Route path="/producer/orders" element={
                  <ProtectedRoute>
                    <ProducerOrders />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/reviews" element={
                  <ProtectedRoute requireRole="producer">
                    <ProducerReviews />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/stats" element={
                  <ProtectedRoute>
                    <ProducerStats />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/certifications" element={
                  <ProtectedRoute>
                    <Certifications />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/transporters" element={
                  <ProtectedRoute>
                    <Transporters />
                  </ProtectedRoute>
                } />
                
                <Route path="/producer/documents" element={
                  <ProtectedRoute>
                    <Documents />
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
                
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/:orderId/confirmation" element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                } />

                {/* Routes Admin */}
                <Route path="/admin" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/management" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/products" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminProducts />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/products/:id" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <ProductDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users/:id" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <UserDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/reviews" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminReviews />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/messages" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminMessages />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/orders" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminOrders />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/orders/:orderId" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <OrderDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/analytics" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout>
                      <AdminAnalytics />
                    </AdminLayout>
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
                
                <Route path="/write-review/:orderId" element={
                  <ProtectedRoute requireRole="consumer">
                    <WriteReview />
                  </ProtectedRoute>
                } />
                
                <Route path="/consumer/loyalty" element={
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
                  
                  {/* Container des notifications */}
                  <NotificationContainer />
                </UserTypeRedirect>
              </div>
            </Router>
          </ModalProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
      
      {/* React Query DevTools en développement */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
