import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';

const LoyaltyProgramSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="container-xl">
        <div className="text-center max-w-3xl mx-auto">
          {/* En-tête */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Programme de Fidélité Harvests
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Gagnez des points à chaque achat et profitez de récompenses exclusives
          </p>

          {/* CTA */}
          <Link
            to="/loyalty"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-harvests-light shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Découvrir le Programme
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyProgramSection;

