import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Send,
	Mail,
	ArrowLeft,
	Layout,
	FileText,
	AlertCircle,
	CheckCircle,
	ChevronRight,
	Plus,
	Trash2,
	Eye,
	Users,
	RefreshCw,
} from "lucide-react";
import SimpleTextEditor from "../../components/admin/SimpleTextEditor";
import { markdownToHtml } from "../blogDetail/blogUtils";
import { getConfig } from "../../config/production";

const AdminEmailComposer = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [formData, setFormData] = useState({
		subject: "",
		content: "",
		originalContent: "",
	});
	const [recipients, setRecipients] = useState({
		userIds: [],
		emails: [],
	});
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("composer"); // composer or preview

	const { API_BASE_URL, FRONTEND_URL } = getConfig();
	const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

	useEffect(() => {
		if (location.state?.emails) {
			setRecipients({
				userIds: location.state.userIds || [],
				emails: location.state.emails || [],
			});
		}
	}, [location.state]);

	const handleEditorChange = (markdown) => {
		const html = markdownToHtml(markdown);
		setFormData({
			...formData,
			originalContent: markdown,
			content: html,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.subject || !formData.originalContent) {
			alert("Veuillez remplir le sujet et le contenu.");
			return;
		}

		if (recipients.emails.length === 0) {
			alert("Aucun destinataire sélectionné.");
			return;
		}

		if (!window.confirm(`Confirmer l'envoi à ${recipients.emails.length} destinataire(s) ?`)) return;

		setLoading(true);
		try {
			const token = localStorage.getItem("harvests_token");
			
            // Personalize message with [LIEN] if present
            let finalContent = formData.content;
            if (finalContent.includes("[LIEN]")) {
                finalContent = finalContent.replace(/\[LIEN\]/g, FRONTEND_URL || window.location.origin);
            }

			const response = await fetch(`${baseUrl}/api/v1/mailing-contacts/send-bulk`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					userIds: recipients.userIds,
					emails: recipients.emails,
					subject: formData.subject,
					message: finalContent,
				}),
			});

			const data = await response.json();
			if (data.status === "success") {
				alert("Emails ajoutés à la file d'attente avec succès !");
				navigate("/admin/contacts");
			} else {
				alert(data.message || "Erreur lors de l'envoi");
			}
		} catch (error) {
			console.error("Error sending emails:", error);
			alert("Erreur serveur lors de l'envoi");
		} finally {
			setLoading(false);
		}
	};

	const templates = [
		{
			name: "Bienvenue / Information",
			subject: "Bienvenue sur HARVESTS - Nouvelles opportunités",
			content: `Bonjour,\n\nNous sommes ravis de vous présenter les nouvelles opportunités sur **HARVESTS**. \n\nNotre plateforme facilite la mise en relation entre producteurs, transporteurs et restaurateurs au Sénégal.\n\nVous pouvez découvrir nos services ici : [LIEN]\n\nÀ très bientôt,\nL'équipe HARVESTS`,
		},
		{
			name: "Relance Professionnelle",
			subject: "Optimisez votre logistique avec HARVESTS",
			content: `Cher partenaire,\n\nAvez-vous déjà exploré nos nouveaux outils de gestion logistique ?\n\nHARVESTS vous permet de suivre vos commandes et d'optimiser vos trajets en quelques clics.\n\nPlus d'infos sur : [LIEN]\n\nCordialement,`,
		},
	];

	const applyTemplate = (template) => {
		handleEditorChange(template.content);
		setFormData((prev) => ({ ...prev, subject: template.subject, originalContent: template.content }));
	};

	return (
		<div className="pb-20 relative overflow-hidden">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				</div>

				<div className="max-w-full mx-auto px-4 md:px-8 py-8 relative z-10">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
					<div>
						<button
							onClick={() => navigate("/admin/contacts")}
							className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-1 group"
						>
							<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
							<span>Retour aux contacts</span>
						</button>
						<h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter leading-none">
							Compositeur d'
							<span className="text-emerald-500 text-stroke-thin italic">
								Emails
							</span>
						</h1>
					</div>

					<div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm">
						<button
							onClick={() => setActiveTab("composer")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
								activeTab === "composer"
									? "bg-slate-900 text-white shadow-md"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<FileText className="w-3.5 h-3.5" />
							<span>Composition</span>
						</button>
						<button
							onClick={() => setActiveTab("preview")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
								activeTab === "preview"
									? "bg-slate-900 text-white shadow-md"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<Eye className="w-3.5 h-3.5" />
							<span>Aperçu Email</span>
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left / Main Column */}
					<div className="lg:col-span-2 space-y-6">
						{activeTab === "composer" ? (
							<div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
								<form onSubmit={handleSubmit} className="space-y-6">
									<div>
										<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
											Objet de l'email
										</label>
										<input
											type="text"
											value={formData.subject}
											onChange={(e) =>
												setFormData({ ...formData, subject: e.target.value })
											}
											placeholder="Ex: Mise à jour de votre compte HARVESTS"
											className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-slate-700 transition-all text-sm shadow-sm"
											required
										/>
									</div>

									<div>
										<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
											Message (Markdown)
										</label>
										<SimpleTextEditor
											value={formData.originalContent}
											onChange={handleEditorChange}
											placeholder="Rédigez votre message ici..."
										/>
									</div>

									<div className="pt-2">
										<button
											type="submit"
											disabled={loading || recipients.emails.length === 0}
											className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-emerald-200"
										>
											{loading ? (
												<RefreshCw className="w-4 h-4 animate-spin" />
											) : (
												<Send className="w-4 h-4" />
											)}
											{loading ? "Envoi..." : `Envoyer à ${recipients.emails.length} destinataire(s)`}
										</button>
									</div>
								</form>
							</div>
						) : (
							/* Email Preview Simulation */
							<div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 overflow-y-auto max-h-[800px] shadow-inner">
								<div className="max-w-[500px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
									<div className="bg-slate-50 p-6 border-b border-slate-100">
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
											Objet
										</p>
										<h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
											{formData.subject || "(Sans objet)"}
										</h2>
									</div>
									<div className="p-8">
									<div className="bg-white p-8 border-b border-slate-50 flex flex-col items-center">
										<div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
											<Layout className="w-8 h-8 text-emerald-600" />
										</div>
										<p className="text-sm font-black text-slate-900 tracking-widest uppercase">
											HARVESTS
										</p>
									</div>

									<div className="p-8">
										<p className="text-sm font-bold text-slate-900 mb-6">
											Bonjour [Nom du Destinataire],
										</p>

										<div
											className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed"
											dangerouslySetInnerHTML={{
												__html: formData.content
													? formData.content.replace(/\[LIEN\]/g, `<a href="#" class="text-emerald-600 font-bold underline">https://harvests.site</a>`)
													: "<p class='italic text-slate-300'>Le contenu de votre email apparaîtra ici...</p>",
											}}
										/>

										<div className="mt-10 pt-6 border-t border-slate-100">
											<p className="text-xs text-slate-500">Cordialement,</p>
											<p className="text-xs font-bold text-slate-900">L'équipe HARVESTS</p>
										</div>

										<div className="mt-12 text-center">
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
												© {new Date().getFullYear()} HARVESTS Sénégal. Tous droits réservés.
											</p>
											<div className="flex justify-center gap-6">
												{["A PROPOS", "CONTACT", "CONFIDENTIALITÉ"].map((link) => (
													<span key={link} className="text-[8px] font-black text-slate-300 uppercase hover:text-emerald-500 cursor-pointer transition-colors tracking-widest">
														{link}
													</span>
												))}
											</div>
										</div>
									</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Sidebar / Right Column */}
					<div className="space-y-6">
						{/* Recipients Info */}
						<div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
							<h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
								<Users className="w-4 h-4 text-emerald-500" />
								Destinataires ({recipients.emails.length})
							</h3>
							
							<div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
								{recipients.emails.length === 0 ? (
									<div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											Choisissez des contacts d'abord
										</p>
									</div>
								) : (
									recipients.emails.map((email, idx) => (
										<div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl group hover:bg-emerald-50 transition-colors">
											<div className="flex items-center gap-2 min-w-0">
												<div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
													<Mail className="w-3 h-3" />
												</div>
												<span className="text-[11px] font-bold text-slate-700 truncate">
													{email}
												</span>
											</div>
											<button 
												onClick={() => setRecipients(prev => ({
													...prev,
													emails: prev.emails.filter((_, i) => i !== idx),
													userIds: prev.userIds.filter((_, i) => i !== idx)
												}))}
												className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
									))
								)}
							</div>
						</div>

						{/* Templates */}
						<div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
							<h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
								<FileText className="w-4 h-4 text-emerald-500" />
								Modèles Disponibles
							</h3>
							<div className="space-y-3">
								{templates.map((template, idx) => (
									<button
										key={idx}
										onClick={() => applyTemplate(template)}
										className="w-full text-left p-4 bg-slate-50 hover:bg-emerald-600 group transition-all rounded-2xl border border-slate-100 shadow-sm"
									>
										<p className="text-xs font-black text-slate-900 group-hover:text-white transition-colors mb-1">
											{template.name}
										</p>
										<p className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-100 truncate">
											{template.subject}
										</p>
									</button>
								))}
							</div>
						</div>

						{/* Tips */}
						<div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
							<div className="flex gap-4">
								<div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
									<AlertCircle className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-wider mb-2">
										Astuces
									</h4>
									<ul className="text-[10px] space-y-2 text-emerald-700 font-bold leading-relaxed">
										<li className="flex gap-2">
											<ChevronRight className="w-3 h-3 shrink-0" />
											Utilisez <span className="text-emerald-900">[LIEN]</span> pour insérer le lien du site.
										</li>
										<li className="flex gap-2">
											<ChevronRight className="w-3 h-3 shrink-0" />
											Personnalisez vos messages pour un meilleur taux d'ouverture.
										</li>
										<li className="flex gap-2">
											<ChevronRight className="w-3 h-3 shrink-0" />
											Les emails sont envoyés en arrière-plan via la file d'attente.
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminEmailComposer;

// Force rebuild 2026-04-15
