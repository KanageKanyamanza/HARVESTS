import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, className = '' }) => {
  const location = useLocation();
  
  // Sur la page d'accueil, ne pas appliquer de fond pour permettre la navbar transparente
  const isHomePage = location.pathname === '/';
  
  // Gérer le fond du body selon la page
  useEffect(() => {
    if (isHomePage) {
      document.body.classList.remove('bg-gray-50');
    } else {
      document.body.classList.add('bg-gray-50');
    }
    
    // Cleanup
    return () => {
      document.body.classList.remove('bg-gray-50');
    };
  }, [isHomePage]);
  
  return (
    <div className={`min-h-screen flex flex-col ${isHomePage ? '' : 'bg-gray-50'}`}>
      <Header />
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
