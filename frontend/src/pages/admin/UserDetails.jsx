import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Shield,
	ShieldCheck,
	Ban,
	UserCheck,
	Edit,
	Trash2,
	CheckCircle,
	XCircle,
	Clock,
	Truck,
	Globe,
	FileText,
	Award,
	Eye,
	Check,
	X,
	Download,
	ExternalLink,
	Maximize2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const UserDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [previewDoc, setPreviewDoc] = useState(null); // { url, name, type }
	const [previewPage, setPreviewPage] = useState(1);

	useEffect(() => {
		loadUser();
	}, [id]);

	const loadUser = async () => {
		try {
			setLoading(true);
			const response = await adminService.getUserById(id);
			setUser(response.data.user);
		} catch (error) {
			console.error("Erreur lors du chargement de l'utilisateur:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir vérifier cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.verifyUser(id);
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors de la vérification:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleVerifyDocument = async (docKey, status, docId = null) => {
		try {
			setActionLoading(true);
			await adminService.verifyUserDocument(id, {
				docType: docKey,
				status,
				docId,
			});
			await loadUser();
		} catch (error) {
			console.error("Erreur lors de la vérification du document:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleRejectVerification = async () => {
		const reason = window.prompt("Raison du rejet de la vérification :");
		if (reason !== null) {
			try {
				setActionLoading(true);
				// On utilise updateUser pour changer le statut ou un champ personnalisé
				// Pour l'instant, on va simuler ou utiliser une approche standard si l'API existe
				// Si verifyUser existe, peut-être y a-t-il une route inverse ?
				// Sinon on utilise updateUser.
				await adminService.updateUser(id, {
					status: "En attente",
					isApproved: false,
					rejectionReason: reason,
				});
				await loadUser();
			} catch (error) {
				console.error("Erreur lors du rejet:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleBanUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.banUser(id, "Banni par un administrateur");
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors du bannissement:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleUnbanUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir débannir cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.unbanUser(id);
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors du débannissement:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const isPdf = (url) => url?.toLowerCase().includes(".pdf");
	const isImage = (url) =>
		/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) ||
		(url?.includes("/image/upload/") && !url?.toLowerCase().includes(".pdf"));

	const getDownloadUrl = (url) => {
		if (!url) return "";
		if (url.includes("cloudinary.com")) {
			// S'assurer qu'on n'a pas déjà un fl_attachment ou d'autres paramètres contradictoires
			let cleanUrl = url.replace(/\/fl_[^/]+/, "");
			if (cleanUrl.includes("/upload/")) {
				return cleanUrl.replace("/upload/", "/upload/fl_attachment/");
			}
		}
		return url;
	};

	const getPdfPreviewUrl = (url, page = 1) => {
		if (!url || !url.toLowerCase().includes(".pdf")) return url;
		if (url.includes("cloudinary.com")) {
			// Cloudinary magic: changer l'extension .pdf en .jpg et prendre la page spécifiée
			return url
				.toLowerCase()
				.replace(".pdf", ".jpg")
				.replace("/upload/", `/upload/w_1200,f_auto,q_auto,pg_${page}/`);
		}
		return url;
	};

	const handleProxyDownload = async (url, filename) => {
		try {
			setActionLoading(true);
			// Nettoyer l'URL pour éviter les doublons de fl_attachment
			const cleanUrl = url.replace("/upload/fl_attachment/", "/upload/");

			const blob = await adminService.downloadDocumentProxy(cleanUrl, filename);
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename || "document.pdf";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			console.error("Error downloading file via proxy:", error);
			// Fallback direct si le proxy échoue
			window.open(getDownloadUrl(url), "_blank");
		} finally {
			setActionLoading(false);
		}
	};

	// Helper to render a document card
	const renderDocumentCard = (doc, title, type = "Document", docKey = null) => {
		if (!doc || (!doc.document && !doc.documentUrl)) return null;

		const url = doc.document || doc.documentUrl;
		const docId = doc._id; // Utile pour les documents dans des tableaux
		const name = title || doc.name || doc.type || "Document";
		const isVerified = doc.isVerified || doc.status === "approved";
		const isRejected = doc.status === "rejected";
		const statusText = isRejected
			? "Rejeté"
			: doc.status === "pending"
			? "En attente"
			: isVerified
			? "Vérifié"
			: "Non vérifié";

		const badgeColor =
			type === "Identité"
				? "bg-amber-100 text-amber-800"
				: type === "Business"
				? "bg-purple-100 text-purple-800"
				: type === "Certification"
				? "bg-blue-100 text-blue-800"
				: "bg-gray-100 text-gray-800";

		return (
			<div className="border rounded-lg p-4 bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
				<div>
					<div className="flex justify-between items-start mb-2">
						<h3 className="font-bold text-gray-900 line-clamp-1" title={name}>
							{name}
						</h3>
						<span
							className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${badgeColor}`}
						>
							{type}
						</span>
					</div>
					<div className="space-y-1 mb-3">
						{doc.number && (
							<p className="text-xs text-gray-600 flex items-center">
								<span className="font-medium mr-1">N°:</span> {doc.number}
							</p>
						)}
						{doc.issuedBy && (
							<p className="text-xs text-gray-600 flex items-center">
								<span className="font-medium mr-1">Par:</span> {doc.issuedBy}
							</p>
						)}
						{doc.validUntil && (
							<p className="text-xs text-gray-600 flex items-center">
								<Calendar className="h-3 w-3 mr-1" />
								Jusqu'au: {new Date(doc.validUntil).toLocaleDateString()}
							</p>
						)}
						{statusText && (
							<span
								className={`text-[10px] flex items-center mt-1 font-bold ${
									doc.status === "rejected" ? "text-red-500" : "text-green-600"
								}`}
							>
								{doc.status === "rejected" ? (
									<XCircle className="h-3 w-3 mr-1" />
								) : (
									<CheckCircle className="h-3 w-3 mr-1" />
								)}
								{statusText}
							</span>
						)}
					</div>
				</div>
				<div className="mt-auto pt-4 border-t flex flex-wrap gap-2 justify-between items-center">
					{isImage(url) || isPdf(url) ? (
						<button
							onClick={() => {
								setPreviewPage(1); // Réinitialiser à la page 1
								setPreviewDoc({
									url: url, // On garde l'URL originale
									name: name,
									type: isPdf(url) ? "pdf" : "image",
									originalUrl: url,
								});
							}}
							className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-2 py-1 rounded"
						>
							<Eye className="h-3.5 w-3.5 mr-1" /> Voir détails
						</button>
					) : (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-2 py-1 rounded"
						>
							<ExternalLink className="h-3.5 w-3.5 mr-1" /> Ouvrir
						</a>
					)}

					<a
						href={getDownloadUrl(url)}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 px-2 py-1 rounded"
					>
						<Download className="h-3.5 w-3.5 mr-1" />{" "}
						{isPdf(url) ? "PDF" : "Télécharger"}
					</a>

					{docKey && (
						<div className="flex gap-1 w-full mt-3 pt-3 border-t">
							{!isVerified && (
								<button
									onClick={() =>
										handleVerifyDocument(docKey, "approved", docId)
									}
									disabled={actionLoading}
									className="flex-1 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 font-medium text-[10px] py-1.5 rounded transition-colors"
								>
									<Check className="h-3 w-3 mr-1" /> Valider
								</button>
							)}
							{!isRejected && (
								<button
									onClick={() =>
										handleVerifyDocument(docKey, "rejected", docId)
									}
									disabled={actionLoading}
									className="flex-1 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 font-medium text-[10px] py-1.5 rounded transition-colors"
								>
									<X className="h-3 w-3 mr-1" /> Rejeter
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		);
	};

	const getStatusColor = (status) => {
		const colors = {
			Actif: "text-green-600 bg-green-100",
			Vérifié: "text-blue-600 bg-blue-100",
			"En attente": "text-yellow-600 bg-yellow-100",
			Banni: "text-red-600 bg-red-100",
		};
		return colors[status] || "text-gray-600 bg-gray-100";
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "Vérifié":
				return <CheckCircle className="h-5 w-5" />;
			case "En attente":
				return <Clock className="h-5 w-5" />;
			case "Banni":
				return <Ban className="h-5 w-5" />;
			default:
				return <Shield className="h-5 w-5" />;
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner size="lg" text="Chargement de l'utilisateur..." />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Utilisateur non trouvé
				</h2>
				<p className="text-gray-600 mb-6">
					L'utilisateur que vous recherchez n'existe pas.
				</p>
				<button
					onClick={() => navigate(-1)}
					className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
				>
					Retour
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => navigate(-1)}
						className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<ArrowLeft className="h-6 w-6" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{user.firstName} {user.lastName}
						</h1>
						<p className="text-gray-600">{user.email}</p>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
							user.status
						)}`}
					>
						{getStatusIcon(user.status)}
						<span className="ml-2">{user.status}</span>
					</span>
				</div>
			</div>

			{/* Rejection Reason if any */}
			{!user.isApproved && user.rejectionReason && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
					<h3 className="text-red-800 font-semibold flex items-center mb-1">
						<XCircle className="h-4 w-4 mr-2" />
						Motif du dernier rejet
					</h3>
					<p className="text-red-700 text-sm">{user.rejectionReason}</p>
				</div>
			)}

			{/* Actions */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
				<div className="flex flex-wrap gap-3">
					{user.status !== "Vérifié" && (
						<button
							onClick={handleVerifyUser}
							disabled={actionLoading}
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
						>
							<UserCheck className="h-4 w-4 mr-2" />
							Vérifier
						</button>
					)}

					{(user.status === "Vérifié" || user.status === "En attente") && (
						<button
							onClick={handleRejectVerification}
							disabled={actionLoading}
							className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center"
						>
							<XCircle className="h-4 w-4 mr-2" />
							Invalider / Rejeter
						</button>
					)}

					{user.status !== "Banni" ? (
						<button
							onClick={handleBanUser}
							disabled={actionLoading}
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
						>
							<Ban className="h-4 w-4 mr-2" />
							Bannir
						</button>
					) : (
						<button
							onClick={handleUnbanUser}
							disabled={actionLoading}
							className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
						>
							<ShieldCheck className="h-4 w-4 mr-2" />
							Débannir
						</button>
					)}
				</div>
			</div>

			{/* Documents & Certifications Section */}
			{((user.certifications && user.certifications.length > 0) ||
				(user.exportLicenses && user.exportLicenses.length > 0) ||
				(user.documents && Object.keys(user.documents).length > 0) ||
				(user.verificationStatus?.verificationDocuments &&
					user.verificationStatus.verificationDocuments.length > 0)) && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
						<Award className="h-5 w-5 mr-2 text-blue-600" />
						Dossier de Vérification & Documents
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Pièces d'identité et documents légaux (objet 'documents') */}
						{user.documents?.nationalId &&
							renderDocumentCard(
								user.documents.nationalId,
								"Carte d'Identité / Passport",
								"Identité",
								"nationalId"
							)}
						{user.documents?.businessLicense &&
							renderDocumentCard(
								user.documents.businessLicense,
								"Registre du Commerce (RCCM)",
								"Business",
								"businessLicense"
							)}
						{(user.documents?.taxId || user.taxId) &&
							renderDocumentCard(
								user.documents?.taxId || { document: user.taxId },
								"NINEA / Attestation Fiscale",
								"Business",
								"taxId"
							)}
						{user.documents?.healthPermit &&
							renderDocumentCard(
								user.documents.healthPermit,
								"Agrément Sanitaire",
								"Hygiène",
								"healthPermit"
							)}
						{user.documents?.firePermit &&
							renderDocumentCard(
								user.documents.firePermit,
								"Certificat de Sécurité Incendie",
								"Sécurité",
								"firePermit"
							)}
						{user.documents?.customsRegistration &&
							renderDocumentCard(
								user.documents.customsRegistration,
								"Enregistrement Douanes",
								"Export",
								"customsRegistration"
							)}
						{user.documents?.transportLicense &&
							renderDocumentCard(
								user.documents.transportLicense,
								"Licence de Transport",
								"Transport",
								"transportLicense"
							)}
						{user.documents?.insuranceCertificate &&
							renderDocumentCard(
								user.documents.insuranceCertificate,
								"Certificat d'Assurance",
								"Assurance",
								"insuranceCertificate"
							)}

						{/* Cas spécifiques où les docs sont à la racine (legacy ou discriminators) */}
						{user.businessLicense &&
							!user.documents?.businessLicense &&
							typeof user.businessLicense === "string" &&
							renderDocumentCard(
								{ document: user.businessLicense },
								"Registre du Commerce",
								"Business",
								"businessLicense"
							)}
						{user.exportLicense &&
							renderDocumentCard(
								{ document: user.exportLicense },
								"Licence d'Exportation Globale",
								"Export",
								"exportLicense"
							)}

						{/* Certifications (tableau 'certifications') */}
						{user.certifications?.map((cert, idx) => (
							<React.Fragment key={`cert-${idx}`}>
								{renderDocumentCard(
									{ ...cert, documentUrl: cert.document },
									cert.name,
									"Certification",
									"certifications"
								)}
							</React.Fragment>
						))}

						{/* Licences d'exportation (tableau 'exportLicenses') */}
						{user.exportLicenses?.map((license, idx) => (
							<React.Fragment key={`license-${idx}`}>
								{renderDocumentCard(
									{ ...license, documentUrl: license.document },
									"Licence d'Exportation",
									"Export",
									"exportLicenses"
								)}
							</React.Fragment>
						))}

						{/* Vérification Documents (Tableau pour Transporters etc.) */}
						{user.verificationStatus?.verificationDocuments?.map(
							(vdoc, idx) => (
								<React.Fragment key={`vdoc-${idx}`}>
									{renderDocumentCard(
										vdoc,
										vdoc.type === "identity"
											? "Pièce d'identité"
											: vdoc.type === "business-license"
											? "Licence Business"
											: vdoc.type === "tax-certificate"
											? "Attestation Fiscale"
											: vdoc.type === "bank-statement"
											? "RIB / Relevé Bancaire"
											: "Document de vérification",
										"Vérification",
										vdoc.type
									)}
								</React.Fragment>
							)
						)}
					</div>
				</div>
			)}

			{/* Informations générales */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Informations personnelles
					</h2>
					<div className="space-y-4">
						<div className="flex items-center">
							<Mail className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Email</p>
								<p className="font-medium">{user.email}</p>
							</div>
						</div>

						<div className="flex items-center">
							<Phone className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Téléphone</p>
								<p className="font-medium">{user.phone}</p>
							</div>
						</div>

						<div className="flex items-center">
							<MapPin className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Pays</p>
								<p className="font-medium">{user.country}</p>
							</div>
						</div>

						<div className="flex items-center">
							<Calendar className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Inscrit le</p>
								<p className="font-medium">{formatDate(user.createdAt)}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Informations du compte
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Type d'utilisateur</span>
							<span className="font-medium capitalize">{user.userType}</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Email vérifié</span>
							<div className="flex items-center">
								{user.isEmailVerified ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Compte approuvé</span>
							<div className="flex items-center">
								{user.isApproved ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Compte actif</span>
							<div className="flex items-center">
								{user.isActive ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Profil complet</span>
							<div className="flex items-center">
								{user.isProfileComplete ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Adresse */}
			{user.address && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-500">Rue</p>
							<p className="font-medium">{user.address.street}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Ville</p>
							<p className="font-medium">{user.address.city}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Région</p>
							<p className="font-medium">{user.address.region}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Code postal</p>
							<p className="font-medium">
								{user.address.postalCode || "Non renseigné"}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Informations spécifiques selon le type d'utilisateur */}
			{user.userType === "producer" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Shield className="h-5 w-5 mr-2 text-green-600" />
						Détails Producteur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<p className="text-sm text-gray-500">Nom de la ferme</p>
							<p className="font-medium text-lg">
								{user.farmName || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Taille de l'exploitation</p>
							<p className="font-medium">
								{user.farmSize?.value} {user.farmSize?.unit || "hectares"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Type d'agriculture</p>
							<p className="font-medium capitalize">
								{user.farmingType || "Conventionnelle"}
							</p>
						</div>
						{user.crops && user.crops.length > 0 && (
							<div className="col-span-full">
								<p className="text-sm text-gray-500 mb-2">Cultures</p>
								<div className="flex flex-wrap gap-2">
									{user.crops.map((crop, i) => (
										<span
											key={i}
											className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100"
										>
											{crop.name} ({crop.category})
										</span>
									))}
								</div>
							</div>
						)}
						<div className="col-span-full pt-4 border-t border-gray-50">
							<p className="text-sm text-gray-500 mb-2">Livraison</p>
							<div className="flex space-x-6 text-sm">
								<span
									className={
										user.deliveryOptions?.canDeliver
											? "text-green-600 font-medium"
											: "text-gray-400"
									}
								>
									{user.deliveryOptions?.canDeliver
										? "✓ Propose la livraison"
										: "✗ Pas de livraison"}
								</span>
								{user.deliveryOptions?.canDeliver && (
									<>
										<span>Rayon: {user.deliveryOptions.deliveryRadius} km</span>
										<span>Frais: {user.deliveryOptions.deliveryFee} FCFA</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{user.userType === "restaurateur" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Shield className="h-5 w-5 mr-2 text-blue-600" />
						Détails Restaurant
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Nom</p>
							<p className="font-medium text-lg">
								{user.restaurantName || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Type de restaurant</p>
							<p className="font-medium capitalize">
								{user.restaurantType || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Capacité</p>
							<p className="font-medium">
								{user.seatingCapacity || "0"} places
							</p>
						</div>
						<div className="col-span-full">
							<p className="text-sm text-gray-500 mb-2">Cuisines</p>
							<div className="flex flex-wrap gap-2">
								{(user.cuisineTypes || []).map((type, i) => (
									<span
										key={i}
										className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
									>
										{type}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{user.userType === "transporter" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Truck className="h-5 w-5 mr-2 text-purple-600" />
						Détails Transporteur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Type de transport</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.transportType || []).map((t, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100 capitalize"
									>
										{t}
									</span>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-500">Modèle de prix</p>
							<p className="font-medium capitalize">
								{user.pricingModel ||
									user.pricingStructure?.model ||
									"À la demande"}
							</p>
						</div>
					</div>
				</div>
			)}

			{user.userType === "exporter" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Globe className="h-5 w-5 mr-2 text-indigo-600" />
						Détails Exportateur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Incoterms acceptés</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.tradingTerms?.acceptedIncoterms || []).map((term, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100"
									>
										{term}
									</span>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-500">Devises</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.tradingTerms?.currencies || []).map((curr, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-100"
									>
										{curr}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Fleet Section for Transporters */}
			{user.userType === "transporter" &&
				user.fleet &&
				user.fleet.length > 0 && (
					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Truck className="h-5 w-5 mr-2 text-purple-600" />
							Flotte de véhicules
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{user.fleet.map((vehicle, idx) => (
								<div
									key={`fleet-${idx}`}
									className="border rounded-lg overflow-hidden bg-gray-50 flex flex-col"
								>
									<div className="h-40 bg-gray-200 relative group">
										{vehicle.image ? (
											<>
												<img
													src={
														typeof vehicle.image === "string"
															? vehicle.image
															: vehicle.image.url
													}
													alt={vehicle.registrationNumber}
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
													<button
														onClick={() =>
															setPreviewDoc({
																url:
																	typeof vehicle.image === "string"
																		? vehicle.image
																		: vehicle.image.url,
																name: `${vehicle.vehicleType} - ${vehicle.registrationNumber}`,
																type: "image",
															})
														}
														className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
													>
														<Maximize2 className="h-5 w-5 text-gray-700" />
													</button>
												</div>
											</>
										) : (
											<div className="w-full h-full flex items-center justify-center text-gray-400">
												<Truck className="h-12 w-12" />
											</div>
										)}
									</div>
									<div className="p-4 flex-1">
										<h3 className="font-bold text-gray-900 capitalize">
											{vehicle.vehicleType}
										</h3>
										<p className="text-sm text-gray-600">
											Matricule: {vehicle.registrationNumber}
										</p>
										<p className="text-sm text-gray-600">
											État: {vehicle.condition}
										</p>
										<div className="mt-2 text-xs bg-white p-2 rounded border border-gray-100 italic">
											{vehicle.capacity?.weight?.value && (
												<p>
													Capacité: {vehicle.capacity.weight.value}{" "}
													{vehicle.capacity.weight.unit}
												</p>
											)}
											{vehicle.capacity?.volume?.value && (
												<p>
													Volume: {vehicle.capacity.volume.value}{" "}
													{vehicle.capacity.volume.unit}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

			{/* Modal de prévisualisation de document */}
			{previewDoc && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
					<div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
						<div className="flex items-center justify-between p-4 border-b bg-gray-50">
							<h3 className="text-lg font-bold text-gray-900 truncate pr-8">
								{previewDoc.name}
							</h3>
							<button
								onClick={() => setPreviewDoc(null)}
								className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="flex-1 overflow-auto bg-gray-100 flex flex-col items-center justify-center p-4 min-h-[500px]">
							<div className="relative group max-w-full">
								<img
									src={
										previewDoc.type === "pdf"
											? getPdfPreviewUrl(previewDoc.url, previewPage)
											: previewDoc.url
									}
									alt={previewDoc.name}
									className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded border bg-white"
									key={`${previewDoc.url}-${previewPage}`} // Forcer le rechargement au changement de page
								/>

								{previewDoc.type === "pdf" && (
									<div className="absolute inset-y-0 -left-12 -right-12 flex items-center justify-between pointer-events-none">
										<button
											onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
											disabled={previewPage === 1}
											className={`pointer-events-auto p-2 rounded-full shadow-lg transition-all ${
												previewPage === 1
													? "bg-gray-200 text-gray-400 cursor-not-allowed"
													: "bg-white text-blue-600 hover:bg-blue-50"
											}`}
										>
											<ChevronLeft className="h-8 w-8" />
										</button>
										<button
											onClick={() => setPreviewPage((p) => p + 1)}
											className="pointer-events-auto p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg transition-all"
										>
											<ChevronRight className="h-8 w-8" />
										</button>
									</div>
								)}
							</div>

							{previewDoc.type === "pdf" && (
								<div className="mt-6 flex items-center space-x-4 bg-white px-4 py-2 rounded-full shadow-sm border">
									<span className="text-sm font-bold text-gray-700">
										Page {previewPage}
									</span>
									<div className="h-4 w-[1px] bg-gray-300"></div>
									<button
										onClick={() =>
											window.open(
												getPdfPreviewUrl(previewDoc.url, previewPage),
												"_blank"
											)
										}
										className="text-xs text-blue-600 hover:underline flex items-center font-medium"
									>
										<Download className="h-3 w-3 mr-1" /> Enregistrer cette page
									</button>
								</div>
							)}
						</div>

						<div className="p-4 border-t bg-gray-50 flex justify-between items-center">
							<p className="text-xs text-gray-500 italic">
								{previewDoc.type === "pdf"
									? "Navigation par image activée pour contourner les restrictions PDF."
									: "Aperçu de l'image originale."}
							</p>
							<div className="flex space-x-3">
								<button
									onClick={() => setPreviewDoc(null)}
									className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
								>
									Fermer
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDetails;
