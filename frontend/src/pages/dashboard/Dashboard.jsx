import React from "react";
import { useUserType } from "../../hooks/useUserType";
import ModularDashboardLayout from "../../components/layout/ModularDashboardLayout";
import DashboardPageSkeleton from "../../components/common/DashboardPageSkeleton";

const Dashboard = () => {
	const { userType, getDefaultRoute } = useUserType();

	// Rediriger vers le dashboard spécifique selon le type d'utilisateur
	// Utiliser navigate au lieu de window.location.href pour éviter un rechargement complet
	const navigate = React.useCallback(() => {
		if (userType) {
			const specificDashboard = getDefaultRoute();
			if (specificDashboard && specificDashboard !== "/dashboard") {
				// Utiliser navigate du routeur au lieu de window.location.href
				// pour éviter de perdre l'état et la position de scroll
				window.location.href = specificDashboard;
			}
		}
	}, [userType, getDefaultRoute]);

	React.useEffect(() => {
		navigate();
	}, [navigate]);

	// Redirection immédiate : gabarit grisé le temps de rejoindre le bon tableau de bord
	return <DashboardPageSkeleton />;
};

export default Dashboard;
