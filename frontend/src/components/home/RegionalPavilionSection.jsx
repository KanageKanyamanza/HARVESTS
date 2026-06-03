import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const initialRegions = [
  {
    id: 'SN',
    name: 'Sénégal',
    image: 'https://images.unsplash.com/photo-1580974582391-a6649c82a85f?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-orange-500/80 to-yellow-500/80'
  },
  {
    id: 'CI',
    name: "Côte d'Ivoire",
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-emerald-600/80 to-green-400/80'
  },
  {
    id: 'CM',
    name: 'Cameroun',
    image: 'https://images.unsplash.com/photo-1517055919650-2f9547d75b31?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-green-600/80 to-red-500/80'
  },
  {
    id: 'ML',
    name: 'Mali',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-yellow-600/80 to-red-500/80'
  }
];

const RegionalPavilionSection = () => {
  const [regions, setRegions] = useState(initialRegions);

  useEffect(() => {
    // Detect user country and sort regions so user's country is first
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code) {
          const userCountryCode = data.country_code;
          setRegions(prev => {
            const newRegions = [...prev];
            const userCountryIndex = newRegions.findIndex(r => r.id === userCountryCode);
            if (userCountryIndex > 0) {
              const [userCountry] = newRegions.splice(userCountryIndex, 1);
              newRegions.unshift(userCountry);
            }
            return newRegions;
          });
        }
      } catch (error) {
        console.error("Erreur lors de la détection du pays:", error);
      }
    };
    detectCountry();
  }, []);

  return (
    <section className="bg-white mb-6 p-4 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-[1500px] lg:mx-auto rounded-sm shadow-sm relative z-10" data-aos="fade-up">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Pavillons Régionaux
          </h2>
          <p className="text-sm text-gray-500 mt-1">Découvrez les spécialités de chaque pays</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {regions.map((region) => (
          <Link
            key={region.id}
            to={`/products?country=${region.id}`}
            className="group relative h-40 sm:h-48 rounded-sm overflow-hidden flex items-center justify-center"
          >
            <img 
              src={region.image} 
              alt={region.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${region.color} mix-blend-multiply opacity-80 group-hover:opacity-90 transition-opacity`}></div>
            
            <div className="relative z-10 text-center px-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mb-2 mx-auto w-12 h-12 flex items-center justify-center border border-white/40">
                <FiMapPin className="text-white w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg sm:text-xl tracking-wide shadow-black/50 drop-shadow-md">
                {region.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RegionalPavilionSection;
