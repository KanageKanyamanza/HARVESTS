import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useUserType } from "../../hooks/useUserType";
import ModularDashboardLayout from "../../components/layout/ModularDashboardLayout";

const Dashboard = () => {
	const { user } = useAuth();
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

	return (
		<div className="p-6 max-w-7xl mx-auto h-full">
			<div className="text-center py-12">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Bienvenue {user?.firstName} !
				</h1>
				<p className="text-gray-600 mb-8">
					Redirection vers votre dashboard spécifique...
				</p>
				<div className="animate-spin mx-auto h-8 w-8 border-4 border-harvests-green border-t-transparent rounded-full"></div>
			</div>
		</div>
	);
};

export default Dashboard;
