import React from "react";
import { Check, Trash2 } from "lucide-react";

const NotificationBulkActions = ({ selectedCount, onMarkAsRead, onDelete }) => {
	if (selectedCount === 0) return null;

	return (
		<div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in backdrop-blur-sm">
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
					<Check className="h-5 w-5" />
				</div>
				<span className="text-sm font-bold text-emerald-800">
					{selectedCount} notification{selectedCount > 1 ? "s" : ""}{" "}
					sélectionnée{selectedCount > 1 ? "s" : ""}
				</span>
			</div>
			<div className="flex items-center gap-3">
				<button
					onClick={onMarkAsRead}
					className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-emerald-200"
				>
					Marquer comme lu
				</button>
				<button
					onClick={onDelete}
					className="px-4 py-2 bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-xl text-sm font-bold transition-all"
				>
					Supprimer
				</button>
			</div>
		</div>
	);
};

export default NotificationBulkActions;
