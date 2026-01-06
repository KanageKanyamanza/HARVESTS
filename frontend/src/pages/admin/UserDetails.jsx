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
	CheckCircle,
	XCircle,
	Clock,
	Globe,
	FileText,
	Award,
	Eye,
	Check,
	X,
	Download,
	ChevronLeft,
	ChevronRight,
	User,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CloudinaryImage from "../../components/common/CloudinaryImage";

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
				await loadUser();
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
				await loadUser();
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
				await loadUser();
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
			return url
				.toLowerCase()
				.replace(".pdf", ".jpg")
				.replace("/upload/", `/upload/w_1200,f_auto,q_auto,pg_${page}/`);
		}
		return url;
	};

	const getStatusColor = (status) => {
		const colors = {
			Actif: "text-emerald-600 bg-emerald-50 border-emerald-100",
			Vérifié: "text-sky-600 bg-sky-50 border-sky-100",
			"En attente": "text-amber-600 bg-amber-50 border-amber-100",
			Banni: "text-rose-600 bg-rose-50 border-rose-100",
		};
		return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "Vérifié":
				return <CheckCircle className="h-4 w-4" />;
			case "En attente":
				return <Clock className="h-4 w-4" />;
			case "Banni":
				return <Ban className="h-4 w-4" />;
			default:
				return <Shield className="h-4 w-4" />;
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

	const renderDocumentCard = (doc, title, type = "Document", docKey = null) => {
		if (!doc || (!doc.document && !doc.documentUrl)) return null;

		const url = doc.document || doc.documentUrl;
		const docId = doc._id;
		const name = title || doc.name || doc.type || "Document";
		const isVerified =
			doc.isVerified || doc.status === "approved" || doc.status === "Vérifié";
		const isRejected = doc.status === "rejected" || doc.status === "rejeté";
		const statusText = isRejected
			? "Rejeté"
			: doc.status === "pending" || doc.status === "En attente"
			? "En attente"
			: isVerified
			? "Vérifié"
			: "Non vérifié";

		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 flex flex-col justify-between group overflow-hidden relative">
				<div className="absolute top-0 right-0 w-24 h-24 bg-gray-100/50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-100/30 transition-all duration-500"></div>

				<div className="relative z-10">
					<div className="flex justify-between items-start mb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
								<FileText className="h-5 w-5" />
							</div>
							<h3
								className="font-black text-gray-900 line-clamp-1 text-sm uppercase tracking-tight"
								title={name}
							>
								{name}
							</h3>
						</div>
						<span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400">
							{type}
						</span>
					</div>

					<div className="space-y-2 mb-6 ml-1">
						{doc.number && (
							<p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
								<Shield className="h-3 w-3 text-gray-300" /> N°: {doc.number}
							</p>
						)}
						{doc.validUntil && (
							<p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
								<Calendar className="h-3 w-3 text-gray-300" /> Expire:{" "}
								{new Date(doc.validUntil).toLocaleDateString()}
							</p>
						)}
						<div
							className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-2 ${
								isRejected
									? "text-rose-600"
									: isVerified
									? "text-emerald-600"
									: "text-amber-600"
							}`}
						>
							{isRejected ? (
								<XCircle className="h-3 w-3" />
							) : (
								<CheckCircle className="h-3 w-3" />
							)}
							{statusText}
						</div>
					</div>
				</div>

				<div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center relative z-10">
					<button
						onClick={() => {
							setPreviewPage(1);
							setPreviewDoc({
								url: url,
								name: name,
								type: isPdf(url) ? "pdf" : "image",
								originalUrl: url,
							});
						}}
						className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-100"
					>
						<Eye className="h-3 w-3" /> Preview
					</button>
					<a
						href={getDownloadUrl(url)}
						target="_blank"
						rel="noopener noreferrer"
						className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-300"
					>
						<Download className="h-4 w-4" />
					</a>

					{docKey && !isVerified && (
						<div className="flex gap-2 w-full mt-2">
							<button
								onClick={() => handleVerifyDocument(docKey, "approved", docId)}
								disabled={actionLoading}
								className="flex-1 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all duration-300"
							>
								Approuver
							</button>
							<button
								onClick={() => handleVerifyDocument(docKey, "rejected", docId)}
								disabled={actionLoading}
								className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300"
							>
								Rejeter
							</button>
						</div>
					)}
				</div>
			</div>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
				<div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
					<XCircle className="h-10 w-10 text-rose-500" />
				</div>
				<h2 className="text-3xl font-[1000] text-gray-900 tracking-tight mb-4">
					Utilisateur non trouvé
				</h2>
				<button
					onClick={() => navigate(-1)}
					className="px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500"
				>
					Retour
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 lg:mb-12 animate-fade-in-down">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
						<button
							onClick={() => navigate(-1)}
							className="p-3 sm:p-4 bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all duration-300 shadow-sm border border-gray-100"
						>
							<ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
						</button>
						<div className="flex items-center gap-4 sm:gap-6">
							<div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative group bg-white">
								{user.avatar ? (
									<CloudinaryImage
										src={user.avatar}
										className="w-full h-full object-cover"
										alt={`${user.firstName} ${user.lastName}`}
									/>
								) : (
									<div className="w-full h-full bg-gray-50 flex items-center justify-center">
										<User className="h-10 w-10 text-gray-300" />
									</div>
								)}
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Award className="text-white h-8 w-8" />
								</div>
							</div>
							<div>
								<div className="flex flex-wrap items-center gap-2 mb-2">
									<span
										className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
											user.status
										)} shadow-sm`}
									>
										{getStatusIcon(user.status)}
										<span className="ml-2">{user.status}</span>
									</span>
									<span className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white shadow-sm border border-gray-800">
										{user.userType}
									</span>
								</div>
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-[1000] text-gray-900 tracking-tighter leading-tight">
									{user.firstName} {user.lastName}
								</h1>
								<p className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[200px] sm:max-w-none">
									{user.email}
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
						{user.status !== "Vérifié" && (
							<button
								onClick={handleVerifyUser}
								disabled={actionLoading}
								className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-[2.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all duration-500 shadow-xl hover:shadow-emerald-100"
							>
								Vérifier le profil
							</button>
						)}
						{user.status !== "Banni" ? (
							<button
								onClick={handleBanUser}
								disabled={actionLoading}
								className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[2.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-500"
							>
								Bannir
							</button>
						) : (
							<button
								onClick={handleUnbanUser}
								disabled={actionLoading}
								className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[2.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all duration-500"
							>
								Débannir
							</button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
					{/* Colonne Gauche - Infos */}
					<div className="xl:col-span-1 space-y-8 animate-fade-in-up delay-150">
						{/* Info Personnelle */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60">
							<div className="flex items-center gap-4 mb-8">
								<div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
									<User className="h-6 w-6" />
								</div>
								<h2 className="text-2xl font-[1000] text-gray-900 tracking-tight">
									Profil
								</h2>
							</div>

							<div className="space-y-6">
								<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
									<Mail className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Email
										</p>
										<p className="text-sm font-bold text-gray-900">
											{user.email}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
									<Phone className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Téléphone
										</p>
										<p className="text-sm font-bold text-gray-900">
											{user.phone || "Non renseigné"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
									<Globe className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Pays
										</p>
										<p className="text-sm font-bold text-gray-900">
											{user.country || "Non renseigné"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
									<Calendar className="h-5 w-5 text-gray-400" />
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Membre depuis
										</p>
										<p className="text-sm font-bold text-gray-900">
											{formatDate(user.createdAt)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Statut du Compte */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">
								Vérifications
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
									<span className="text-sm font-bold text-gray-700">
										Email Vérifié
									</span>
									{user.isEmailVerified ? (
										<CheckCircle className="h-5 w-5 text-emerald-500" />
									) : (
										<XCircle className="h-5 w-5 text-rose-500" />
									)}
								</div>
								<div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
									<span className="text-sm font-bold text-gray-700">
										Approuvé
									</span>
									{user.isApproved ? (
										<CheckCircle className="h-5 w-5 text-emerald-500" />
									) : (
										<XCircle className="h-5 w-5 text-rose-500" />
									)}
								</div>
								<div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
									<span className="text-sm font-bold text-gray-700">
										Profil Complet
									</span>
									{user.isProfileComplete ? (
										<CheckCircle className="h-5 w-5 text-emerald-500" />
									) : (
										<XCircle className="h-5 w-5 text-rose-500" />
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Colonne Droite - Documents */}
					<div className="xl:col-span-2 space-y-10 animate-fade-in-up delay-[300ms]">
						{(user.documents ||
							user.verificationStatus?.verificationDocuments ||
							user.certifications) && (
							<div className="space-y-8">
								<div className="flex items-center justify-between px-2">
									<div>
										<h2 className="text-3xl font-[1000] text-gray-900 tracking-tighter">
											Documentation
										</h2>
										<p className="text-gray-500 font-medium">
											Dossier légal et certifications
										</p>
									</div>
									<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
										<FileText className="h-6 w-6" />
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Documents légaux */}
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
											"Attestation Fiscale",
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
									{user.documents?.transportLicense &&
										renderDocumentCard(
											user.documents.transportLicense,
											"Licence de Transport",
											"Logistique",
											"transportLicense"
										)}

									{/* Transporters Docs */}
									{user.verificationStatus?.verificationDocuments?.map(
										(vdoc, idx) => (
											<React.Fragment key={`vdoc-${idx}`}>
												{renderDocumentCard(
													vdoc,
													vdoc.type === "identity"
														? "Carte d'identité"
														: vdoc.type === "business-license"
														? "Licence Business"
														: "Document Vérification",
													"Vérification",
													vdoc.type
												)}
											</React.Fragment>
										)
									)}

									{/* Certifications */}
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
								</div>
							</div>
						)}

						{/* Infos Adresse */}
						{user.address && (
							<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60">
								<div className="flex items-center gap-4 mb-6 sm:mb-10">
									<div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
										<MapPin className="h-6 w-6" />
									</div>
									<h2 className="text-xl sm:text-2xl font-[1000] text-gray-900 tracking-tight">
										Adresse d'activité
									</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
											Rue
										</p>
										<p className="text-base sm:text-lg font-bold text-gray-900">
											{user.address.street}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
											Ville
										</p>
										<p className="text-base sm:text-lg font-bold text-gray-900">
											{user.address.city}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
											Région
										</p>
										<p className="text-base sm:text-lg font-bold text-gray-900">
											{user.address.region}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modal Preview Premium */}
			{previewDoc && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
					<div
						className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl"
						onClick={() => setPreviewDoc(null)}
					></div>
					<div className="relative w-full max-w-6xl h-full flex flex-col bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-4 sm:p-8 border-b border-gray-100 bg-white/50 backdrop-blur-md">
							<div>
								<h3 className="text-lg sm:text-2xl font-[1000] text-gray-900 tracking-tighter uppercase line-clamp-1">
									{previewDoc.name}
								</h3>
								<p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">
									Aperçu du document officiel
								</p>
							</div>
							<div className="flex items-center gap-2 sm:gap-4">
								<a
									href={getDownloadUrl(previewDoc.originalUrl)}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 sm:p-4 bg-gray-100 text-gray-600 rounded-xl sm:rounded-2xl hover:bg-gray-200 transition-all"
								>
									<Download className="h-4 w-4 sm:h-5 sm:w-5" />
								</a>
								<button
									onClick={() => setPreviewDoc(null)}
									className="p-2 sm:p-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-gray-200"
								>
									<X className="h-4 w-4 sm:h-5 sm:w-5" />
								</button>
							</div>
						</div>

						{/* Modal Content */}
						<div className="flex-1 overflow-auto bg-gray-50/50 p-8 flex items-start justify-center">
							{previewDoc.type === "pdf" ? (
								<div className="w-full max-w-3xl flex flex-col items-center gap-8">
									<div className="bg-white p-4 rounded-[2rem] shadow-2xl border border-white">
										<img
											src={getPdfPreviewUrl(previewDoc.url, previewPage)}
											alt="PDF Page"
											className="w-full h-auto rounded-xl"
										/>
									</div>
									<div className="flex items-center gap-6 bg-gray-900 text-white p-4 rounded-[2rem] shadow-xl">
										<button
											onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
											className="p-2 hover:bg-white/10 rounded-full transition-colors"
										>
											<ChevronLeft />
										</button>
										<span className="font-black text-sm uppercase tracking-widest">
											Page {previewPage}
										</span>
										<button
											onClick={() => setPreviewPage((p) => p + 1)}
											className="p-2 hover:bg-white/10 rounded-full transition-colors"
										>
											<ChevronRight />
										</button>
									</div>
								</div>
							) : (
								<img
									src={previewDoc.url}
									alt="Document"
									className="max-w-full h-auto rounded-[2rem] shadow-2xl border border-white p-2 bg-white"
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDetails;
