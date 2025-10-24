import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import FinancialInfo from "../../../components/common/FinancialInfo";
import NotificationSettings from "../../../components/common/NotificationSettings";
import {
	FiSettings,
	FiCreditCard,
	FiBell,
	FiShield,
	FiMapPin,
	FiUser,
	FiEdit3,
	FiSave,
	FiX,
	FiRefreshCw,
} from "react-icons/fi";
import commonService from "../../../services/commonService";

const SettingsPage = () => {
	const { user, isAuthenticated, refreshUser } = useAuth();
	const [activeTab, setActiveTab] = useState("profile");
	const [loading, setLoading] = useState(true);

	// États pour les données
	const [financialInfo, setFinancialInfo] = useState(null);
	const [notificationSettings, setNotificationSettings] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState(null);
	const [deliveryAddresses, setDeliveryAddresses] = useState([]);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Charger les données une seule fois
	useEffect(() => {
		if (!isAuthenticated || !user) return;

		const loadSettingsData = async () => {
			try {
				setLoading(true);

				const [
					financialResponse,
					notificationResponse,
					addressesResponse,
				] = await Promise.all([
					commonService.getFinancialInfo().catch(() => ({ data: null })),
					commonService.getNotificationSettings().catch(() => ({ data: null })),
					commonService.getDeliveryAddresses().catch(() => ({ data: [] })),
				]);

				setFinancialInfo(financialResponse.data);
				setNotificationSettings(notificationResponse.data);
				setDeliveryAddresses(addressesResponse.data || []);
				
				// Créer le statut de vérification basé sur les données utilisateur
				const verificationData = {
					email: {
						verified: user.isEmailVerified,
						verifiedAt: user.emailVerifiedAt,
						pending: !user.isEmailVerified
					},
					phone: {
						verified: user.isPhoneVerified,
						verifiedAt: user.phoneVerifiedAt,
						pending: !user.isPhoneVerified
					},
					overall: {
						verified: user.isEmailVerified && user.isPhoneVerified,
						level: user.isEmailVerified ? 'Vérifié' : 'Non vérifié'
					}
				};
				
				setVerificationStatus(verificationData);
				console.log('Données de vérification calculées:', verificationData);
			} catch (error) {
				console.error("Erreur lors du chargement des paramètres:", error);
			} finally {
				setLoading(false);
			}
		};

		loadSettingsData();
	}, [isAuthenticated, user]);

	// Fonction pour actualiser manuellement
	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			await refreshUser();
			
			// Recalculer le statut après le refresh
			const verificationData = {
				email: {
					verified: user.isEmailVerified,
					verifiedAt: user.emailVerifiedAt,
					pending: !user.isEmailVerified
				},
				phone: {
					verified: user.isPhoneVerified,
					verifiedAt: user.phoneVerifiedAt,
					pending: !user.isPhoneVerified
				},
				overall: {
					verified: user.isEmailVerified && user.isPhoneVerified,
					level: user.isEmailVerified ? 'Vérifié' : 'Non vérifié'
				}
			};
			
			setVerificationStatus(verificationData);
			console.log('🔄 Données actualisées manuellement:', verificationData);
		} catch (error) {
			console.error('Erreur lors de l\'actualisation:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const tabs = [
		{ id: "profile", label: "Profil", icon: FiUser },
		{ id: "financial", label: "Financier", icon: FiCreditCard },
		{ id: "notifications", label: "Notifications", icon: FiBell },
		{ id: "security", label: "Sécurité", icon: FiShield },
		{ id: "addresses", label: "Adresses", icon: FiMapPin },
	];

	if (!isAuthenticated || !user) {
		return (
			<ModularDashboardLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Accès non autorisé
						</h2>
						<p className="text-gray-600">
							Vous devez être connecté pour accéder à cette page.
						</p>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	if (loading) {
		return (
			<ModularDashboardLayout>
				<div className="p-6 max-w-7xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							<div className="lg:col-span-1">
								<div className="h-64 bg-gray-200 rounded"></div>
							</div>
							<div className="lg:col-span-3">
								<div className="h-96 bg-gray-200 rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
			<div className="p-6 max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<FiSettings className="mr-3" />
						Paramètres
					</h1>
					<p className="text-gray-600 mt-1">
						Gérez vos informations personnelles, préférences et paramètres de
						compte
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar des onglets */}
					<div className="lg:col-span-1">
						<nav className="md:space-y-1 flex md:flex-col overflow-x-auto">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											activeTab === tab.id
												? "bg-blue-100 text-blue-700"
												: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
										}`}
									>
										<Icon className="mr-3 h-5 w-5" />
										{tab.label}
									</button>
								);
							})}
						</nav>
					</div>

					{/* Contenu principal */}
					<div className="lg:col-span-3">
						<div className="bg-white rounded-lg shadow">
							{/* Onglet Profil */}
							{activeTab === "profile" && (
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FiUser className="mr-2" />
											Informations du profil
										</h2>
										{/* <button
											onClick={() => {}}
											className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
										>
											<FiEdit3 className="mr-1" />
											Modifier
										</button> */}
									</div>

									<div className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Prénom
												</label>
												<p className="mt-1 text-sm text-gray-900">
													{user.firstName}
												</p>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Nom
												</label>
												<p className="mt-1 text-sm text-gray-900">
													{user.lastName}
												</p>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Email
												</label>
												<p className="mt-1 text-sm text-gray-900">
													{user.email}
												</p>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Téléphone
												</label>
												<p className="mt-1 text-sm text-gray-900">
													{user.phone || "Non renseigné"}
												</p>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Type d'utilisateur
												</label>
												<p className="mt-1 text-sm text-gray-900 capitalize">
													{user.userType}
												</p>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Pays
												</label>
												<p className="mt-1 text-sm text-gray-900">
													{user.country || "Non renseigné"}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Onglet Financier */}
							{activeTab === "financial" && (
								<FinancialInfo data={financialInfo} />
							)}

							{/* Onglet Notifications */}
							{activeTab === "notifications" && (
								

									<NotificationSettings data={notificationSettings} />
							)}

							{/* Onglet Sécurité */}
							{activeTab === "security" && (
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FiShield className="mr-2" />
											Sécurité et vérification
										</h2>
										<button
											onClick={handleRefresh}
											disabled={isRefreshing}
											className={`flex items-center px-3 py-2 text-sm font-medium ${
												isRefreshing 
													? 'text-gray-400 cursor-not-allowed' 
													: 'text-blue-600 hover:text-blue-800'
											}`}
										>
											<FiRefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
											{isRefreshing ? 'Actualisation...' : 'Actualiser'}
										</button>
									</div>

									{verificationStatus && (
										<div className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="flex items-center justify-between p-4 border rounded-lg">
													<div className="flex items-center">
														<div
															className={`w-3 h-3 rounded-full mr-3 ${
																verificationStatus.email?.verified
																	? "bg-green-500"
																	: "bg-red-500"
															}`}
														></div>
														<div>
															<p className="font-medium">Email</p>
															<p className="text-sm text-gray-600">
																{verificationStatus.email?.verified
																	? "Vérifié"
																	: "Non vérifié"}
															</p>
														</div>
													</div>
												</div>

												<div className="flex items-center justify-between p-4 border rounded-lg">
													<div className="flex items-center">
														<div
															className={`w-3 h-3 rounded-full mr-3 ${
																verificationStatus.phone?.verified
																	? "bg-green-500"
																	: "bg-red-500"
															}`}
														></div>
														<div>
															<p className="font-medium">Téléphone</p>
															<p className="text-sm text-gray-600">
																{verificationStatus.phone?.verified
																	? "Vérifié"
																	: "Non vérifié"}
															</p>
														</div>
													</div>
												</div>
											</div>

											<div className="mt-6">
												<h3 className="font-medium mb-3">
													Niveau de vérification
												</h3>
												<div className="bg-gray-100 rounded-lg p-4">
													<p className="text-sm text-gray-600">
														{verificationStatus.overall?.level || "Non vérifié"}
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Onglet Adresses */}
							{activeTab === "addresses" && (
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FiMapPin className="mr-2" />
											Adresses de livraison
										</h2>
										<button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
											<FiEdit3 className="mr-1" />
											Ajouter
										</button>
									</div>

									<div className="space-y-4">
										{deliveryAddresses.length > 0 ? (
											deliveryAddresses.map((address, index) => (
												<div key={index} className="border rounded-lg p-4">
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-medium">{address.name}</h3>
															<p className="text-sm text-gray-600">
																{address.address}
															</p>
															<p className="text-sm text-gray-600">
																{address.city}, {address.region}{" "}
																{address.postalCode}
															</p>
															<p className="text-sm text-gray-600">
																{address.country}
															</p>
														</div>
														{address.isDefault && (
															<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																Par défaut
															</span>
														)}
													</div>
												</div>
											))
										) : (
											<div className="text-center py-8 text-gray-500">
												<FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
												<p>Aucune adresse de livraison enregistrée</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default SettingsPage;
