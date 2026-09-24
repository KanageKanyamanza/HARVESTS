import React from "react";
import { useTranslation } from "react-i18next";
import { FiClock } from "react-icons/fi";

const DAY_KEYS = {
	monday: "monday",
	tuesday: "tuesday",
	wednesday: "wednesday",
	thursday: "thursday",
	friday: "friday",
	saturday: "saturday",
	sunday: "sunday",
};

const VendorHours = ({
	hours,
	openField = "open",
	closeField = "close",
	isOpenField = "isOpen",
}) => {
	const { t } = useTranslation("public");
	if (!hours || Object.keys(hours).length === 0) {
		return (
			<div className="text-center py-8">
				<FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					{t("vendorProfile.noHoursTitle")}
				</h3>
				<p className="text-gray-500">
					{t("vendorProfile.noHoursDescription")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{Object.entries(hours).map(([day, dayHours]) => {
				// Skip if not a day object (like _id or other mongoose fields)
				if (typeof dayHours !== "object" || dayHours === null) return null;
				if (!DAY_KEYS[day]) return null;

				const isOpen = dayHours[isOpenField] ?? dayHours.isAvailable ?? true;
				const open = dayHours[openField] || dayHours.start;
				const close = dayHours[closeField] || dayHours.end;

				return (
					<div
						key={day}
						className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
					>
						<span className="text-sm font-medium text-gray-900">
							{t(`vendorProfile.days.${DAY_KEYS[day]}`)}
						</span>
						<span className="text-sm text-gray-600">
							{!isOpen
								? t("vendorProfile.closed")
								: open && close
								? `${open} - ${close}`
								: t("vendorProfile.open")}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default VendorHours;
