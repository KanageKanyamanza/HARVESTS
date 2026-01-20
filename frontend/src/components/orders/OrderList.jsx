import React, { useState, useEffect, useRef } from "react";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import OrderListItem from "./OrderListItem";

const OrderList = ({
	orders = [],
	userType = "consumer",
	onUpdateStatus,
	loading = false,
	updatingOrders = new Set(),
}) => {
	const initializedOrderIds = useRef(new Set());
	const [collapsedOrders, setCollapsedOrders] = useState(() => {
		const initialCollapsed = new Set();
		orders.forEach((order) => {
			if (order?._id) {
				initialCollapsed.add(order._id);
				initializedOrderIds.current.add(order._id);
			}
		});
		return initialCollapsed;
	});

	useEffect(() => {
		setCollapsedOrders((prev) => {
			const newSet = new Set(prev);
			orders.forEach((order) => {
				if (order?._id && !initializedOrderIds.current.has(order._id)) {
					newSet.add(order._id);
					initializedOrderIds.current.add(order._id);
				}
			});
			const orderIds = new Set(orders.map((o) => o?._id).filter(Boolean));
			newSet.forEach((orderId) => {
				if (!orderIds.has(orderId)) {
					newSet.delete(orderId);
					initializedOrderIds.current.delete(orderId);
				}
			});
			return newSet;
		});
	}, [orders]);

	const toggleCollapse = (orderId) => {
		setCollapsedOrders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(orderId)) newSet.delete(orderId);
			else newSet.add(orderId);
			return newSet;
		});
	};

	if (loading && orders.length === 0) {
		return (
			<div className="space-y-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 p-6 animate-pulse shadow-sm"
					>
						<div className="flex justify-between items-center mb-4">
							<div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
							<div className="h-8 bg-gray-200 rounded-full w-24"></div>
						</div>
						<div className="space-y-3">
							<div className="h-4 bg-gray-200 rounded w-full"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (orders.length === 0) {
		return (
			<div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[2.5rem] p-16 text-center shadow-sm">
				<div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-full mx-auto mb-6">
					<FiShoppingBag className="h-10 w-10 text-gray-300" />
				</div>
				<h3 className="text-xl font-black text-gray-900 mb-2">
					{["producer", "transformer"].includes(userType) ?
						"Aucune commande reçue"
					:	"Aucun achat effectué"}
				</h3>
				<p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
					{["producer", "transformer"].includes(userType) ?
						"Dès qu'un client passera une commande, elle apparaîtra ici avec tous les détails nécessaires."
					:	"Parcourez notre catalogue et découvrez des produits d'exception livrables chez vous."
					}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{orders.map((order) => {
				if (!order?._id) return null;
				return (
					<OrderListItem
						key={order._id}
						order={order}
						userType={userType}
						onUpdateStatus={onUpdateStatus}
						updatingOrders={updatingOrders}
						isCollapsed={collapsedOrders.has(order._id)}
						toggleCollapse={toggleCollapse}
					/>
				);
			})}
		</div>
	);
};

export default OrderList;
