import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiSearch, FiCompass } from "react-icons/fi";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16 bg-white">
			{/* Fonds décoratifs */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-emerald-100/40 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-amber-100/40 rounded-full blur-[120px]" />
			</div>

			<div className="relative z-10 max-w-lg w-full text-center">
				<div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-6">
					<div className="w-6 h-[2px] bg-emerald-600" />
					<span>Harvests</span>
					<div className="w-6 h-[2px] bg-emerald-600" />
				</div>

				<div className="relative mb-6 select-none">
					<div className="text-[8rem] sm:text-[10rem] font-[1000] leading-none tracking-tighter bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
						404
					</div>
					<FiCompass className="absolute -top-2 right-6 h-10 w-10 text-amber-400 rotate-12 opacity-80" />
				</div>

				<h1 className="text-2xl sm:text-3xl font-[1000] text-gray-900 tracking-tight mb-3">
					Cette page a pris un autre chemin de récolte
				</h1>
				<p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">
					La page que vous cherchez n'existe pas ou a été déplacée. Revenez en
					lieu sûr avec les liens ci-dessous.
				</p>

				<div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
					>
						<FiArrowLeft className="h-4 w-4" />
						Retour
					</button>

					<Link
						to="/"
						className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
					>
						<FiHome className="h-4 w-4" />
						Accueil
					</Link>
				</div>

				<div className="pt-6 border-t border-gray-100">
					<Link
						to="/products"
						className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
					>
						<FiSearch className="h-4 w-4" />
						Voir tous les produits
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
