import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContextObject";

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications doit être utilisé dans un NotificationProvider",
		);
	}
	return context;
};
