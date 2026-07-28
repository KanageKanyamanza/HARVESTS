import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { Globe } from 'lucide-react';
import { useGeoLocation } from '../../hooks/useGeoLocation';

import burkinaImg from '../../assets/images/pavilions/burkina_faso.jpg';
import senegalImg from '../../assets/images/pavilions/senegal.jpg';
import coteDivoireImg from '../../assets/images/pavilions/cote_divoire.jpg';
import camerounImg from '../../assets/images/pavilions/cameroun.jpg';
import maliImg from '../../assets/images/pavilions/mali.jpg';
import ghanaImg from '../../assets/images/pavilions/ghana.jpg';
import nigeriaImg from '../../assets/images/pavilions/nigeria.jpg';
import beninImg from '../../assets/images/pavilions/benin.jpg';

const initialRegions = [
  {
    id: 'BF',
    name: 'Burkina Faso',
    image: burkinaImg,
    color: 'from-red-600/80 to-yellow-500/80'
  },
  {
    id: 'SN',
    name: 'Sénégal',
    image: senegalImg,
    color: 'from-orange-500/80 to-yellow-500/80'
  },
  {
    id: 'CI',
    name: "Côte d'Ivoire",
    image: coteDivoireImg,
    color: 'from-emerald-600/80 to-green-400/80'
  },
  {
    id: 'CM',
    name: 'Cameroun',
    image: camerounImg,
    color: 'from-green-700/80 to-red-500/80'
  },
  {
    id: 'ML',
    name: 'Mali',
    image: maliImg,
    color: 'from-yellow-600/80 to-red-600/80'
  },
  {
    id: 'GH',
    name: 'Ghana',
    image: ghanaImg,
    color: 'from-yellow-500/80 to-red-600/80'
  },
  {
    id: 'NG',
    name: 'Nigeria',
    image: nigeriaImg,
    color: 'from-green-700/80 to-green-500/80'
  },
  {
    id: 'BJ',
    name: 'Bénin',
    image: beninImg,
    color: 'from-green-600/80 to-yellow-500/80'
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
    <section className="md:bg-white my-8 p-0 sm:p-4 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto md:rounded-2xl md:shadow-agri-card md:border border-emerald-100 relative z-10" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5514] uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4 text-[#31BC2E]" />
            <span>Sourcing Transfrontalier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
            Pavillons Régionaux & Monuments
          </h2>
          <p className="text-sm text-gray-600 mt-1">Explorez les spécialités agricoles et vendeurs certifiés de chaque pays</p>
        </div>
        <Link to="/products" className="hidden md:flex text-xs sm:text-sm font-bold text-[#1A5514] hover:text-[#31BC2E] transition-colors items-center gap-1">
          Voir tous les pays →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {regions.map((region) => (
          <Link
            key={region.id}
            to={`/products?country=${region.id}`}
            className="group relative h-44 sm:h-52 rounded-2xl overflow-hidden flex flex-col justify-end p-4 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-black/5"
          >
            <img
              src={region.image}
              alt={region.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />

            <div className="relative z-10 text-left space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold mb-1">
                <FiMapPin className="w-3 h-3 text-emerald-400" />
                <span>{region.id}</span>
              </div>
              <h3 className="text-white font-extrabold text-sm sm:text-base drop-shadow-md leading-snug">
                {region.name}
              </h3>
              <span className="text-[10px] text-white/80 font-medium group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                Produits certifiés →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="md:hidden mx-auto text-center p-2 my-5">
        <Link
          to="/products"
          className="text-xs sm:text-sm font-bold text-white hover:text-[#31BC2E] transition-colors bg-[#1A5514] rounded-full p-3 w-64 mx-auto flex items-center justify-center gap-1"
        >
          Voir tous les pays →
        </Link>
      </div>
    </section>
  );
};

export default RegionalPavilionSection;
