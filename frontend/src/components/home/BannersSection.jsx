import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Banner54 from '../../assets/images/Bannar-54.png';
import Banner55 from '../../assets/images/Bannar-55.png';

const BannersSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 2,
    minutes: 18,
    seconds: 46
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <section className="py-20 bg-harvests-light" data-aos="fade-up">
      <div className="container-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Bannière 1 - Sale of the Month */}
          <div 
            className="relative rounded-2xl text-center overflow-hidden h-[550px] bg-cover bg-center group"
            style={{ backgroundImage: `url(${Banner54})` }}
            data-aos="fade-right"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-transparent to-transparent"></div>
            <div className="relative h-full flex flex-col justify-start p-8 pt-10">
              <p className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wider">
                Best Deals
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Sale of the Month
              </h2>
              
              {/* Compte à rebours */}
              <div className="flex gap-4 mb-8 mx-auto">
                <div className="text-center">
                  <div className="bg-white rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft.days)}</span>
                  </div>
                  <span className="text-white text-xs uppercase">Jours</span>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft.hours)}</span>
                  </div>
                  <span className="text-white text-xs uppercase">Heures</span>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft.minutes)}</span>
                  </div>
                  <span className="text-white text-xs uppercase">Mins</span>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft.seconds)}</span>
                  </div>
                  <span className="text-white text-xs uppercase">Secs</span>
                </div>
              </div>

              <Link
                to="/products"
                className="inline-flex mx-auto items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-primary-500 hover:text-white transition-all duration-300 group-hover:scale-105 w-fit"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Bannière 2 - Fresh Fruit */}
          <div 
            className="relative rounded-2xl text-center overflow-hidden h-[550px] bg-cover bg-center group"
            style={{ backgroundImage: `url(${Banner55})` }}
            data-aos="fade-left"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/30 via-transparent to-transparent"></div>
            <div className="relative h-full flex flex-col justify-start p-8 pt-10">
              <p className="text-gray-800 text-sm font-medium mb-2 uppercase tracking-wider">
                Summer Sale
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                100% Fresh Fruit
              </h2>
              <p className="text-gray-700 mb-6 text-lg">
                Jusqu'à <span className="text-primary-500 font-bold text-2xl">64% OFF</span>
              </p>

              <Link
                to="/products?category=fruits"
                className="inline-flex mx-auto items-center justify-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 transition-all duration-300 group-hover:scale-105 w-fit"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannersSection;

