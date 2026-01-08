import React from "react";
import { Check, Trash2, Clock } from "lucide-react";
import {
	getNotificationIcon,
	getNotificationColor,
	formatNotificationDate,
} from "../../utils/notificationHelpers";

const NotificationItem = ({
	notification,
	isSelected,
	onToggleSelect,
	onMarkAsRead,
	onDelete,
}) => {
	const iconContainerClass = `
    flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center mr-3 transition-transform group-hover:scale-110 shadow-sm
    ${
			notification.category === "success"
				? "bg-emerald-100 text-emerald-600"
				: notification.category === "warning"
				? "bg-amber-100 text-amber-600"
				: notification.category === "error"
				? "bg-rose-100 text-rose-600"
				: "bg-blue-100 text-blue-600"
		}
  `;

	return (
		<tr
			className={`
        group transition-all duration-300 hover:bg-gray-50/80
        ${!notification.read ? "bg-emerald-50/30" : ""}
      `}
		>
			<td className="px-4 py-3 w-12">
				<div className="relative flex items-center justify-center">
					<input
						type="checkbox"
						checked={isSelected}
						onChange={onToggleSelect}
						className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"
					/>
					<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
				</div>
			</td>

			<td className="px-4 py-3">
				<div className="flex items-center">
					<div className={iconContainerClass}>
						<div className="transform scale-75">
							{getNotificationIcon(notification.type, notification.category)}
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-0.5">
							<p
								className={`text-sm ${
									!notification.read
										? "font-black text-gray-900"
										: "font-bold text-gray-600"
								} truncate`}
							>
								{notification.title}
							</p>
							{!notification.read && (
								<span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
							)}
						</div>
						<p className="text-gray-500 line-clamp-1 text-[11px] leading-tight max-w-xl">
							{notification.message}
						</p>
					</div>
				</div>
			</td>

			<td className="px-4 py-3">
				<span
					className={`
            inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest
            ${
							notification.category === "success"
								? "bg-emerald-100 text-emerald-700"
								: notification.category === "warning"
								? "bg-amber-100 text-amber-700"
								: notification.category === "error"
								? "bg-rose-100 text-rose-700"
								: "bg-blue-100 text-blue-700"
						}
        `}
				>
					{notification.category || notification.type || "Général"}
				</span>
			</td>

			<td className="px-4 py-3">
				<div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
					<Clock className="h-3 w-3 mr-1.5 text-gray-300" />
					{formatNotificationDate(notification.timestamp)}
				</div>
			</td>

			<td className="px-4 py-3 text-right">
				<div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
					{!notification.read && (
						<button
							onClick={onMarkAsRead}
							className="group/btn p-1.5 rounded-lg hover:bg-emerald-50 text-gray-300 hover:text-emerald-600 transition-all"
							title="Marquer comme lu"
						>
							<Check className="h-4 w-4" />
						</button>
					)}
					<button
						onClick={onDelete}
						className="group/btn p-1.5 rounded-lg hover:bg-rose-50 text-gray-300 hover:text-rose-600 transition-all"
						title="Supprimer"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</td>
		</tr>
	);
};

export default NotificationItem;
