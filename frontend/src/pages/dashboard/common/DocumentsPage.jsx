import React, { useState, useEffect } from "react";
import { FiFileText, FiShield, FiAward } from "react-icons/fi";
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

			alert("Documents mis à jour avec succès !");
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
			alert("Erreur lors de la sauvegarde.");
		} finally {
			setSaving(false);
		}
	};

	// Determine doc types based on user role
	const getDocTypes = () => {
		switch (user?.userType) {
			case "producer":
				return [/*"nationalId",*/ "businessLicense", "taxId"];
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
				// "nationalId" removed as per request
				return [];
		}
	};

	const activeDocTypes = getDocTypes();

	if (!isAuthenticated || !user) {
		return (
			<ModularDashboardLayout>
				<div>Chargement...</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
			<div className="p-3 max-w-4xl mx-auto">
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 flex items-center">
							<FiFileText className="mr-3" />
							Documents & Certifications
						</h1>
						<p className="text-gray-600 mt-1">
							Gérez vos documents légaux et certifications professionnelles.
						</p>
					</div>
					<button
						onClick={handleSave}
						disabled={saving}
						className={`px-4 py-2 rounded-md text-white font-medium ${
							saving
								? "bg-blue-400 cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-700"
						}`}
					>
						{saving ? "Enregistrement..." : "Enregistrer les modifications"}
					</button>
				</div>

				{activeDocTypes.length > 0 && (
					<div className="bg-white shadow rounded-lg p-6 mb-6">
						<DocumentsSection
							documents={documents}
							onInputChange={handleDocumentChange}
							editing={true}
							docTypes={activeDocTypes}
						/>
					</div>
				)}

				<div className="bg-white shadow rounded-lg p-6">
					<CertificationsSection
						certifications={certifications}
						onInputChange={handleCertificationChange}
						editing={true}
					/>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default DocumentsPage;
