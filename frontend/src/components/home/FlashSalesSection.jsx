import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';
import { FiClock } from 'react-icons/fi';

const FlashSalesSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    loadProducts();
    
    // Simulate countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 }; // reset
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Fetch actual flash sales
      const response = await productService.getFlashSales();
      if (response.data.status === 'success') {
        setProducts(response.data.data.products || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des ventes flash:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white mb-6 p-4 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-[1500px] lg:mx-auto rounded-sm shadow-sm relative z-10" data-aos="fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-red-600 flex items-center">
            Ventes Flash
          </h2>
          
          <div className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded">
            <FiClock className="mr-2" />
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded mx-0.5">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            :
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded mx-0.5">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            :
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded mx-0.5">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <Link
          to="/products"
          className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
        >
          Voir toutes les offres
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar scroll-smooth">
            {products.map((product) => (
              <div key={product._id} className="min-w-[200px] max-w-[200px] sm:min-w-[240px] sm:max-w-[240px] snap-start flex-none relative">
                {product.flashSale?.isActive && product.flashSale?.discountPercentage && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 z-20 rounded-sm">
                    -{product.flashSale.discountPercentage}%
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FlashSalesSection;
