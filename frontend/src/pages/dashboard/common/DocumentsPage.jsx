import React, { useState, useEffect } from "react";
import {
	FileText,
	ShieldCheck,
	Award,
	Save,
	AlertCircle,
	Info,
	CheckCircle2,
	Clock,
	Sparkles,
	ArrowRight,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import DocumentsSection from "../../../components/profile/specific/DocumentsSection";
import CertificationsSection from "../../../components/profile/specific/CertificationsSection";
import {
	producerService,
	transformerService,
	restaurateurService,
	exporterService,
	transporterService,
	commonService,
} from "../../../services";

const DocumentsPage = () => {
	const { user, isAuthenticated, refreshUser, setUser, updateProfile } =
		useAuth();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [documents, setDocuments] = useState({});
	const [certifications, setCertifications] = useState([]);

	useEffect(() => {
		if (user) {
			setDocuments(user.documents || {});
			setCertifications(user.certifications || []);
		}
	}, [user]);

	const handleDocumentChange = (e) => {
		const { value } = e.target;
		setDocuments(value);
	};

	const handleCertificationChange = (e) => {
		const { value } = e.target;
		setCertifications(value);
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			const updateData = {
				documents,
				certifications,
			};

			let response;
			// Select appropriate service based on user type
			if (user?.userType === "restaurateur") {
				response = await restaurateurService.updateMyProfile(updateData);
			} else if (user?.userType === "producer") {
				response = await producerService.updateProfile(updateData);
			} else if (user?.userType === "transformer") {
				response = await transformerService.updateProfile(updateData);
			} else if (user?.userType === "exporter") {
				response = await exporterService.updateProfile(updateData);
			} else if (user?.userType === "transporter") {
				response = await transporterService.updateProfile(updateData);
			} else {
				response = await commonService.updateCommonProfile(updateData);
			}

			const updatedUser =
				response.data?.data?.restaurateur ||
				response.data?.data?.transformer ||
				response.data?.data?.producer ||
				response.data?.data?.consumer ||
				response.data?.data?.exporter ||
				response.data?.data?.transporter ||
				response.data?.data?.user ||
				response.data?.user;

			if (updatedUser) {
				if (setUser) setUser(updatedUser);
				else if (updateProfile) await updateProfile(updatedUser);
				else if (refreshUser) await refreshUser();
			} else if (refreshUser) {
				await refreshUser();
			}

			// Better success feedback could be added here
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
		} finally {
			setSaving(false);
		}
	};

	const getDocTypes = () => {
		switch (user?.userType) {
			case "producer":
				return ["businessLicense", "taxId"];
			case "restaurateur":
				return ["businessLicense", "taxId", "healthPermit", "firePermit"];
			case "transporter":
				return [
					"businessLicense",
					"taxId",
					"transportLicense",
					"insuranceCertificate",
				];
			case "transformer":
				return ["businessLicense", "taxId", "healthPermit"];
			case "exporter":
				return ["businessLicense", "taxId"];
			default:
				return [];
		}
	};

	const activeDocTypes = getDocTypes();

	if (!isAuthenticated || !user) {
		return (
			<ModularDashboardLayout userType={user?.userType}>
				<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
					<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
					<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
						Chargement de votre coffre-fort...
					</p>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout userType={user?.userType}>
			<div className="min-h-screen relative overflow-hidden pb-20 bg-harvests-light/20">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				</div>

				<div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12">
					{/* Header Section */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-down">
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
								<div className="w-5 h-[2px] bg-emerald-600 rounded-full"></div>
								<span>Conformité</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								Documents &{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Certifications.
								</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-xl">
								Gérez vos documents légaux et valorisez votre savoir-faire par
								des certifications reconnues.
							</p>
						</div>

						<div className="bg-white/70 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/60 shadow-sm flex items-center gap-4">
							<div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
								<ShieldCheck className="h-6 w-6" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Statut Profil
								</p>
								<div className="flex items-center gap-2">
									<span className="text-lg font-[1000] text-gray-900 tracking-tight">
										Verifié Harvests
									</span>
									<CheckCircle2 className="h-4 w-4 text-emerald-500" />
								</div>
							</div>
						</div>
					</div>

					{/* Info Alert */}
					<div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200/50 animate-fade-in-up delay-100 group">
						<div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
							<Sparkles className="w-32 h-32" />
						</div>
						<div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
							<div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
								<Info className="h-8 w-8 text-white" />
							</div>
							<div className="space-y-2 text-center md:text-left">
								<h3 className="text-xl font-[1000] tracking-tight">
									Confidentialité & Sécurité
								</h3>
								<p className="text-blue-50/80 font-medium text-sm leading-relaxed max-w-2xl">
									Vos documents administratifs sont strictement confidentiels.
									Ils sont utilisés uniquement par nos experts pour valider
									l'authenticité de votre activité et renforcer la confiance de
									vos futurs partenaires.
								</p>
							</div>
							<div className="md:ml-auto">
								<div className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
									Chiffrement AES-256
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-10">
						{/* Documents Section */}
						{activeDocTypes.length > 0 && (
							<div className="space-y-6 animate-fade-in-up delay-200">
								<div className="flex items-center gap-3 px-2">
									<div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
									<h2 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase tracking-[0.1em]">
										Documents Administratifs
									</h2>
								</div>
								<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-4 md:p-8 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500">
									<DocumentsSection
										documents={documents}
										onInputChange={handleDocumentChange}
										editing={true}
										docTypes={activeDocTypes}
									/>
								</div>
							</div>
						)}

						{/* Certifications Section */}
						<div className="space-y-6 animate-fade-in-up delay-300">
							<div className="flex items-center gap-3 px-2">
								<div className="w-1.5 h-6 bg-teal-600 rounded-full"></div>
								<h2 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase tracking-[0.1em]">
									Labels & Distinctions
								</h2>
							</div>
							<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-4 md:p-8 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500">
								<CertificationsSection
									certifications={certifications}
									onInputChange={handleCertificationChange}
									editing={true}
								/>
							</div>
						</div>
					</div>

					{/* Fixed Save Bar */}
					<div className="fixed bottom-8 left-0 right-0 z-50 px-4 pointer-events-none lg:pl-72">
						<div className="max-w-5xl mx-auto flex justify-center md:justify-end">
							<button
								onClick={handleSave}
								disabled={saving}
								className={`pointer-events-auto group relative flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] text-white font-[1000] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
									saving ?
										"bg-gray-400 cursor-not-allowed"
									:	"bg-gray-900 hover:bg-emerald-600 hover:shadow-emerald-200"
								}`}
							>
								{saving ?
									<>
										<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
										Enregistrement...
									</>
								:	<>
										<Save className="h-4 w-4" />
										Enregistrer les modifications
										<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
									</>
								}
							</button>
						</div>
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default DocumentsPage;
