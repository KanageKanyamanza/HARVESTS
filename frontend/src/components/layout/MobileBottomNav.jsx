import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Grid, Sprout, Newspaper, TrendingUp } from "lucide-react";

const navItems = [
	{ name: "Produits", href: "/products", icon: Package },
	{ name: "Catégories", href: "/categories", icon: Grid },
	{ name: "Producteurs", href: "/producteurs", icon: Sprout },
	{ name: "Blog", href: "/blog", icon: Newspaper },
	{ name: "Tarifs", href: "/pricing", icon: TrendingUp },
];

const MobileBottomNav = () => {
	const location = useLocation();

	return (
		<nav
			className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
			aria-label="Navigation mobile"
		>
			<div className="grid grid-cols-5">
				{navItems.map((item) => {
					const isActive =
						location.pathname === item.href ||
						location.pathname.startsWith(`${item.href}/`);
					const Icon = item.icon;

					return (
						<Link
							key={item.name}
							to={item.href}
							className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
								isActive ? "text-[#1A5514]" : "text-gray-500"
							}`}
						>
							<Icon
								className={`h-5 w-5 ${isActive ? "text-[#1A5514]" : "text-gray-500"}`}
								strokeWidth={isActive ? 2.5 : 2}
							/>
							{item.name}
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default MobileBottomNav;
