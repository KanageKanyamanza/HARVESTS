import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, AlertTriangle, Plus } from "lucide-react";
import { producerService } from "../../services";

const LOW_STOCK_THRESHOLD = 5;

const IconBadge = ({ Icon, count, tone, title, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		title={title}
		className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
	>
		<Icon className="h-5 w-5" />
		{count > 0 && (
			<span
				className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${tone}`}
			>
				{count > 9 ? "9+" : count}
			</span>
		)}
	</button>
);

const ProducerQuickStats = () => {
	const navigate = useNavigate();
	const [pendingOrders, setPendingOrders] = useState(0);
	const [lowStockCount, setLowStockCount] = useState(0);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const ordersRes = await producerService.getOrders({
					status: "pending",
					limit: 1,
				});
				const total = ordersRes.data?.total ?? ordersRes.data?.data?.total ?? 0;
				if (!cancelled) setPendingOrders(total);
			} catch {
				// silencieux : indicateur secondaire, ne doit pas casser le dashboard
			}

			try {
				const productsRes = await producerService.getProducts();
				const products =
					productsRes.data?.data?.products ||
					productsRes.data?.products ||
					productsRes.data ||
					[];
				const lowStock = Array.isArray(products)
					? products.filter(
							(p) => p.isActive !== false && (p.stock ?? 0) <= LOW_STOCK_THRESHOLD
						).length
					: 0;
				if (!cancelled) setLowStockCount(lowStock);
			} catch {
				// silencieux
			}
		};

		load();
		const interval = setInterval(load, 5 * 60 * 1000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="flex items-center gap-0.5">
			<IconBadge
				Icon={ShoppingBag}
				count={pendingOrders}
				tone="bg-orange-500"
				title="Commandes en attente"
				onClick={() => navigate("/producer/orders")}
			/>
			<IconBadge
				Icon={AlertTriangle}
				count={lowStockCount}
				tone="bg-rose-500"
				title="Produits en stock faible"
				onClick={() => navigate("/producer/products")}
			/>
			<button
				type="button"
				onClick={() => navigate("/producer/products/add")}
				title="Ajouter un produit"
				className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
			>
				<Plus className="h-5 w-5" />
			</button>
		</div>
	);
};

export default ProducerQuickStats;
