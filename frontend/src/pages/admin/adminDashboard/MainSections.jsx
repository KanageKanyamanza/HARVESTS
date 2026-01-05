import React from "react";
import { Link } from "react-router-dom";
import {
	Users,
	Package,
	ShoppingCart,
	BarChart3,
	CreditCard,
	ChevronRight,
} from "lucide-react";

const MainSections = () => {
	const sections = [
		{
			to: "/admin/users",
			icon: Users,
			color: "blue",
			title: "Utilisateurs",
			description: "Comptes & Permissions",
		},
		{
			to: "/admin/products",
			icon: Package,
			color: "green",
			title: "Catalogue",
			description: "Approbation Produits",
		},
		{
			to: "/admin/orders",
			icon: ShoppingCart,
			color: "purple",
			title: "Commandes",
			description: "Ventes & Logistique",
		},
		{
			to: "/admin/analytics",
			icon: BarChart3,
			color: "orange",
			title: "Analytique",
			description: "Données & Rapports",
		},
		{
			to: "/admin/subscriptions",
			icon: CreditCard,
			color: "emerald",
			title: "Abonnements",
			description: "Plans & Revenus",
		},
	];

	const getColorClasses = (color) => {
		switch (color) {
			case "blue":
				return "from-blue-500 to-blue-600 shadow-blue-200 text-blue-600 bg-blue-50 border-blue-100";
			case "green":
				return "from-green-500 to-green-600 shadow-green-200 text-green-600 bg-green-50 border-green-100";
			case "purple":
				return "from-purple-500 to-purple-600 shadow-purple-200 text-purple-600 bg-purple-50 border-purple-100";
			case "orange":
				return "from-orange-500 to-orange-600 shadow-orange-200 text-orange-600 bg-orange-50 border-orange-100";
			case "emerald":
				return "from-emerald-500 to-emerald-600 shadow-emerald-200 text-emerald-600 bg-emerald-50 border-emerald-100";
			default:
				return "from-gray-500 to-gray-600 shadow-gray-200 text-gray-600 bg-gray-50 border-gray-100";
		}
	};

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 relative overflow-hidden group">
			<div className="p-4 border-b border-gray-100 flex items-center justify-between">
				<div>
					<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
						Sections
					</h3>
					<p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">
						Management Central
					</p>
				</div>
			</div>
			<div className="p-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					{sections.map((section, index) => {
						const colorClasses = getColorClasses(section.color);
						return (
							<Link
								key={index}
								to={section.to}
								className={`group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-300 ${colorClasses
									.split(" ")
									.slice(3)
									.join(
										" "
									)} hover:bg-white hover:shadow-2xl hover:shadow-gray-200 hover:-translate-y-2`}
							>
								<div
									className={`p-5 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-white shadow-xl`}
								>
									<section.icon
										className={`w-8 h-8 ${colorClasses.split(" ")[2]}`}
									/>
								</div>
								<div className="text-center">
									<p className="text-base font-black text-gray-900 tracking-tight mb-1 group-hover:text-green-600 transition-colors">
										{section.title}
									</p>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
										{section.description}
									</p>
								</div>

								<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
									<ChevronRight
										className={`w-4 h-4 ${colorClasses.split(" ")[2]}`}
									/>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default MainSections;
