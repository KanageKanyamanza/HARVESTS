import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '../common/BackToTop';
import ChatBot from '../chat/ChatBot';
import SEOHead from '../seo/SEOHead';
import { useSEO } from '../../hooks/useSEO';

const Layout = ({ children, className = '', seo }) => {
  const location = useLocation();
  const seoConfig = useSEO(seo);
  
  // Sur la page d'accueil, ne pas appliquer de fond pour permettre la navbar transparente
  const isHomePage = location.pathname === '/';
  
  // Gérer le fond du body selon la page
  useEffect(() => {
    if (isHomePage) {
      document.body.classList.remove('bg-harvests-light');
    } else {
      document.body.classList.add('bg-harvests-light');
    }
    
    // Cleanup
    return () => {
      document.body.classList.remove('bg-harvests-light');
    };
  }, [isHomePage]);

  // Rafraîchir AOS lors des changements de route
  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className={`min-h-screen flex flex-col ${isHomePage ? '' : 'bg-harvests-light'}`}>
      {/* SEO Head pour toutes les pages publiques */}
      <SEOHead {...seoConfig} />
      
      <Header />
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      <Footer />
      <BackToTop />
      <ChatBot />
    </div>
  );
};

export default Layout;
