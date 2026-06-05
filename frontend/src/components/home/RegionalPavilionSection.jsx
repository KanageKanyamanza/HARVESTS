import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { useGeoLocation } from '../../hooks/useGeoLocation';

const initialRegions = [
  {
    id: 'BF',
    name: 'Burkina Faso',
    image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-red-600/80 to-yellow-500/80'
  },
  {
    id: 'SN',
    name: 'Sénégal',
    image: 'https://images.unsplash.com/photo-1580974582391-a6649c82a85f?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-orange-500/80 to-yellow-500/80'
  },
  {
    id: 'CI',
    name: "Côte d'Ivoire",
    image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-emerald-600/80 to-green-400/80'
  },
  {
    id: 'CM',
    name: 'Cameroun',
    image: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-green-700/80 to-red-500/80'
  },
  {
    id: 'ML',
    name: 'Mali',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-yellow-600/80 to-red-600/80'
  },
  {
    id: 'GH',
    name: 'Ghana',
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-yellow-500/80 to-red-600/80'
  },
  {
    id: 'NG',
    name: 'Nigeria',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'from-green-700/80 to-green-500/80'
  }
];

const RegionalPavilionSection = () => {
  const [regions, setRegions] = useState(initialRegions);
  const { countryCode } = useGeoLocation();

  useEffect(() => {
    if (!countryCode) return;
    setRegions(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(r => r.id === countryCode);
      if (idx > 0) {
        const [userCountry] = updated.splice(idx, 1);
        updated.unshift(userCountry);
      }
      return updated;
    });
  }, [countryCode]);

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {regions.map((region) => (
          <Link
            key={region.id}
            to={`/products?country=${region.id}`}
            className="group relative h-36 sm:h-44 rounded-sm overflow-hidden flex items-center justify-center"
          >
            <img
              src={region.image}
              alt={region.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${region.color} mix-blend-multiply opacity-80 group-hover:opacity-90 transition-opacity`}></div>

            <div className="relative z-10 text-center px-2">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-2 mx-auto w-10 h-10 flex items-center justify-center border border-white/40">
                <FiMapPin className="text-white w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base tracking-wide drop-shadow-md leading-tight">
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
