import React, { useState, useEffect } from "react";
import {
	Bell,
	Mail,
	Smartphone,
	Monitor,
	Check,
	Save,
	X,
	Info,
	ChevronRight,
	ShieldCheck,
	Zap,
} from "lucide-react";
import { commonService } from "../../services";
import { useNotifications } from "../../hooks/useNotifications";
import { useTranslation } from "react-i18next";
import PushNotificationToggle from "./PushNotificationToggle";

const NotificationSettings = ({ onUpdate, loading = false, data = null }) => {
	const { t } = useTranslation("settings");
	const { showSuccess, showError } = useNotifications();
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [notifications, setNotifications] = useState({
		email: true,
		sms: false,
		push: true,
		marketing: false,
		orderUpdates: true,
		priceAlerts: false,
	});

	useEffect(() => {
		const loadNotificationPreferences = async () => {
			if (data) {
				setNotifications((prev) => ({ ...prev, ...data }));
				return;
			}
			try {
				const response = await commonService.getNotificationPreferences();
				const prefs =
					response.data?.data?.preferences || response.data?.notifications;
				if (prefs) setNotifications((prev) => ({ ...prev, ...prefs }));
			} catch (error) {
				console.error("Erreur lors du chargement des préférences:", error);
			}
		};
		loadNotificationPreferences();
	}, [data]);

	const handleToggle = (key) => {
		setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			await commonService.updateNotificationPreferences(notifications);
			showSuccess(t("notifications.saved"));
			setIsEditing(false);
			onUpdate && onUpdate();
		} catch (error) {
			console.error("Erreur lors de la mise à jour:", error);
			showError(t("notifications.error"));
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		commonService.getNotificationPreferences().then((response) => {
			const prefs =
				response.data?.data?.preferences || response.data?.notifications;
			if (prefs) setNotifications((prev) => ({ ...prev, ...prefs }));
		});
	};

	const notificationOptions = [
		{
			key: "email",
			label: t("notifications.options.email.label"),
			description: t("notifications.options.email.description"),
			icon: <Mail className="h-5 w-5" />,
			color: "text-blue-500",
			bgColor: "bg-blue-50/50",
		},
		{
			key: "sms",
			label: t("notifications.options.sms.label"),
			description: t("notifications.options.sms.description"),
			icon: <Smartphone className="h-5 w-5" />,
			color: "text-emerald-500",
			bgColor: "bg-emerald-50/50",
		},
		{
			key: "push",
			label: t("notifications.options.push.label"),
			description: t("notifications.options.push.description"),
			icon: <Monitor className="h-5 w-5" />,
			color: "text-indigo-500",
			bgColor: "bg-indigo-50/50",
		},
		{
			key: "orderUpdates",
			label: t("notifications.options.orderUpdates.label"),
			description: t("notifications.options.orderUpdates.description"),
			icon: <Zap className="h-5 w-5" />,
			color: "text-amber-500",
			bgColor: "bg-amber-50/50",
		},
		{
			key: "priceAlerts",
			label: t("notifications.options.priceAlerts.label"),
			description: t("notifications.options.priceAlerts.description"),
			icon: <Bell className="h-5 w-5" />,
			color: "text-rose-500",
			bgColor: "bg-rose-50/50",
		},
		{
			key: "marketing",
			label: t("notifications.options.marketing.label"),
			description: t("notifications.options.marketing.description"),
			icon: <Bell className="h-5 w-5" />,
			color: "text-purple-500",
			bgColor: "bg-purple-50/50",
		},
	];

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-gray-100 rounded-2xl w-1/3"></div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-32 bg-gray-50 rounded-[2rem]"></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 px-2">
					<Bell className="h-5 w-5 text-amber-500/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						{t("notifications.title")}
					</h3>
				</div>
				{!isEditing ?
					<button
						onClick={() => setIsEditing(true)}
						className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-amber-500 transition-all active:scale-95"
					>
						<Bell className="h-4 w-4" />
						{t("notifications.configure")}
					</button>
				:	<div className="flex items-center gap-3">
						<button
							onClick={handleCancel}
							className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900"
						>
							{t("notifications.cancel")}
						</button>
						<button
							onClick={handleSave}
							disabled={saving}
							className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all active:scale-95 disabled:bg-gray-400"
						>
							{saving ?
								<div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							:	<Save className="h-4 w-4" />}
							{saving ? "..." : t("notifications.save")}
						</button>
					</div>
				}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{notificationOptions.map((option) => {
					const isEnabled = notifications[option.key];
					return (
						<div
							key={option.key}
							className={`relative flex flex-col p-6 rounded-[2.5rem] border-2 transition-all duration-500 group ${
								isEnabled ?
									"border-amber-100 bg-white shadow-xl shadow-amber-50/50"
								:	"border-gray-50 bg-gray-50/30 grayscale opacity-70"
							}`}
						>
							<div className="flex items-start justify-between mb-4">
								<div
									className={`p-4 rounded-2xl ${option.bgColor} ${option.color} group-hover:scale-110 transition-transform duration-500`}
								>
									{option.icon}
								</div>

								{isEditing ?
									<button
										onClick={() => handleToggle(option.key)}
										role="switch"
										aria-checked={Boolean(isEnabled)}
										aria-label={option.label}
										className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ring-4 ${
											isEnabled ?
												"bg-amber-500 ring-amber-100"
											:	"bg-gray-200 ring-gray-100"
										}`}
									>
										<span
											className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
												isEnabled ? "translate-x-6" : "translate-x-1.5"
											}`}
										/>
									</button>
								:	<div
										className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
											isEnabled ?
												"bg-amber-100 text-amber-700"
											:	"bg-gray-200 text-gray-400"
										}`}
									>
										{isEnabled ? t("notifications.on") : t("notifications.off")}
									</div>
								}
							</div>

							<div className="space-y-1">
								<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest">
									{option.label}
								</h4>
								<p className="text-xs text-gray-500 font-medium leading-relaxed">
									{option.description}
								</p>
							</div>

							{!isEditing && isEnabled && (
								<div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
									<ChevronRight className="h-4 w-4 text-amber-400" />
								</div>
							)}
						</div>
					);
				})}
			</div>

			{!isEditing && (
				<div className="mt-12 bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
					<div className="absolute top-0 right-0 p-8 opacity-10">
						<ShieldCheck className="h-24 w-24" />
					</div>
					<div className="relative z-10 flex items-center gap-6">
						<div className="p-3 bg-amber-500 text-white rounded-2xl">
							<Info className="h-6 w-6" />
						</div>
						<div>
							<h4 className="text-sm font-[1000] uppercase tracking-widest mb-1">
								{t("notifications.privacyTitle")}
							</h4>
							<p className="text-xs text-gray-400 font-medium max-w-2xl leading-relaxed">
								{t("notifications.privacyText")}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* ── Section Push Notifications ───────────────────────────── */}
			<div className="mt-12 pt-8 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2 mb-6">
					<Smartphone className="h-5 w-5 text-violet-500/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						{t("notifications.pushTitle")}
					</h3>
				</div>
				<PushNotificationToggle isAdmin={false} />
			</div>
		</div>
	);
};

export default NotificationSettings;
