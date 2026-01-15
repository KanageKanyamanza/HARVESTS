import React, { useState, useEffect } from "react";
import {
	Mail,
	Users,
	Send,
	FileText,
	Plus,
	Image as ImageIcon,
	Trash2,
	Clock,
	CheckCircle,
	Edit,
	X,
	BarChart3,
	TrendingUp,
} from "lucide-react";
import { getConfig } from "../../config/production";
import SimpleTextEditor from "../../components/admin/SimpleTextEditor";
import { markdownToHtml } from "../blogDetail/blogUtils";

const MiniMetric = ({ label, value, icon: Icon, color }) => (
	<div className="bg-white/50 backdrop-blur-sm border border-white rounded-2xl p-4 flex items-center gap-3 hover:bg-white transition-all group shadow-sm hover:shadow-md">
		<div
			className={`w-10 h-10 rounded-xl overflow-hidden bg-${color}-50 flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform shadow-sm`}
		>
			<Icon className="w-5 h-5" />
		</div>
		<div>
			<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
				{label}
			</p>
			<h4 className="text-lg font-black text-slate-900 tracking-tighter">
				{value}
			</h4>
		</div>
	</div>
);

const AdminNewsletter = () => {
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");
	const [imageUrl, setImageUrl] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [sendModalOpen, setSendModalOpen] = useState(false);
	const [newsletterToSend, setNewsletterToSend] = useState(null);
	const [sendMode, setSendMode] = useState("all"); // 'all' or 'specific'
	const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
	const [searchTerm, setSearchTerm] = useState("");

	// Stats state
	const [stats, setStats] = useState({
		totalSubscribers: 0,
		sentNewsletters: 0,
	});

	// Data lists
	const [newsletters, setNewsletters] = useState([]);
	const [subscribers, setSubscribers] = useState([]);

	// Form state
	const [formData, setFormData] = useState({
		subject: "",
		content: "",
		originalContent: "", // Markdown content
	});

	const fetchData = async () => {
		setLoading(true);
		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			const authHeader = {
				Authorization: `Bearer ${localStorage.getItem("harvests_token")}`,
			};

			// Fetch Subscribers
			const subRes = await fetch(`${baseUrl}/api/v1/newsletter/subscribers`, {
				headers: authHeader,
			});
			const subData = await subRes.json();

			// Fetch Newsletters
			const newsRes = await fetch(`${baseUrl}/api/v1/newsletter`, {
				headers: authHeader,
			});
			const newsData = await newsRes.json();

			const subsList =
				subData.status === "success"
					? subData.data.subscribers
					: Array.isArray(subData)
					? subData
					: [];
			const newsList =
				newsData.status === "success"
					? newsData.data.newsletters
					: Array.isArray(newsData)
					? newsData
					: [];

			setSubscribers(subsList);
			setNewsletters(newsList);

			const sentNewslettersList = newsList.filter((n) => n.status === "sent");
			const totalSent = sentNewslettersList.length;
			const totalRecipients = sentNewslettersList.reduce(
				(acc, curr) => acc + (curr.recipientCount || 0),
				0
			);
			const totalOpens = sentNewslettersList.reduce(
				(acc, curr) => acc + (curr.opens ? curr.opens.length : 0),
				0
			);

			const avgOpenRate =
				totalRecipients > 0
					? ((totalOpens / totalRecipients) * 100).toFixed(1)
					: "0.0";

			setStats({
				totalSubscribers: subsList.length,
				sentNewsletters: totalSent,
				openRate: avgOpenRate,
			});
		} catch (error) {
			console.error("Error fetching newsletter data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		const formDataUpload = new FormData();
		formDataUpload.append("file", file);
		formDataUpload.append("folder", "newsletter");

		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			const response = await fetch(`${baseUrl}/api/v1/upload/cloudinary`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("harvests_token")}`,
				},
				body: formDataUpload,
			});

			const data = await response.json();
			if (data.status === "success" && data.data?.url) {
				setImageUrl(data.data.url);
			} else if (data.secure_url) {
				setImageUrl(data.secure_url);
			}
		} catch (error) {
			console.error("Error uploading image:", error);
		} finally {
			setUploading(false);
		}
	};

	const handleEditorChange = (newMarkdown) => {
		const htmlContent = markdownToHtml(newMarkdown);
		setFormData({
			...formData,
			originalContent: newMarkdown,
			content: htmlContent,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			const url = editingId
				? `${baseUrl}/api/v1/newsletter/${editingId}`
				: `${baseUrl}/api/v1/newsletter`;

			const method = editingId ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("harvests_token")}`,
				},
				body: JSON.stringify({
					subject: formData.subject,
					content: formData.content, // HTML for sending/display
					originalContent: formData.originalContent, // Markdown for editing
					imageUrl: imageUrl,
				}),
			});

			if (response.ok) {
				setFormData({ subject: "", content: "", originalContent: "" });
				setImageUrl("");
				setEditingId(null);
				setActiveTab("overview");
				fetchData();
			}
		} catch (error) {
			console.error("Error creating/updating newsletter:", error);
		}
	};

	const handleEdit = (newsletter) => {
		setFormData({
			subject: newsletter.subject,
			content: newsletter.content,
			originalContent: newsletter.originalContent || "", // Load markdown if available
		});
		setImageUrl(newsletter.imageUrl || "");
		setEditingId(newsletter._id);
		setActiveTab("create");
	};

	const cancelEdit = () => {
		setFormData({ subject: "", content: "", originalContent: "" });
		setImageUrl("");
		setEditingId(null);
		setActiveTab("overview");
	};

	const openSendModal = (newsletter) => {
		setNewsletterToSend(newsletter);
		setSendMode("all");
		setSelectedSubscribers(new Set());
		setSearchTerm("");
		setSendModalOpen(true);
	};

	const closeSendModal = () => {
		setSendModalOpen(false);
		setNewsletterToSend(null);
	};

	const toggleSubscriber = (id) => {
		const newSelected = new Set(selectedSubscribers);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedSubscribers(newSelected);
	};

	const handleSelectAll = (subs) => {
		if (selectedSubscribers.size === subs.length) {
			setSelectedSubscribers(new Set());
		} else {
			setSelectedSubscribers(new Set(subs.map((s) => s._id)));
		}
	};

	const confirmSend = async () => {
		if (!newsletterToSend) return;

		const recipients =
			sendMode === "specific" ? Array.from(selectedSubscribers) : [];

		if (sendMode === "specific" && recipients.length === 0) {
			alert("Veuillez sélectionner au moins un abonné.");
			return;
		}

		if (
			!confirm(
				`Confirmer l'envoi de "${newsletterToSend.subject}" à ${
					sendMode === "all"
						? "tous les abonnés"
						: recipients.length + " abonnés"
				} ?`
			)
		) {
			return;
		}

		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			const response = await fetch(
				`${baseUrl}/api/v1/newsletter/${newsletterToSend._id}/send`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("harvests_token")}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						recipients: recipients.length > 0 ? recipients : undefined,
					}),
				}
			);

			if (response.ok) {
				fetchData();
				alert("Newsletter envoyée avec succès !");
				closeSendModal();
			} else {
				const errorData = await response.json();
				alert(errorData.message || "Erreur lors de l'envoi");
			}
		} catch (error) {
			console.error("Error sending newsletter:", error);
			alert("Erreur lors de l'envoi");
		}
	};

	// handleSend removed/replaced

	const handleDelete = async (id) => {
		if (!confirm("Supprimer cette newsletter ?")) return;
		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			await fetch(`${baseUrl}/api/v1/newsletter/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("harvests_token")}`,
				},
			});
			fetchData();
		} catch (error) {
			console.error("Error deleting newsletter:", error);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (loading && newsletters.length === 0)
		return (
			<div className="flex items-center justify-center h-screen">Charge...</div>
		);

	return (
		<div className="min-h-screen md:pl-6 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-4">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-1">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Marketing</span>
						</div>
						<h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter leading-none">
							Newsletter{" "}
							<span className="text-emerald-500 text-stroke-thin italic">
								Manager
							</span>
						</h1>
					</div>

					<div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm">
						<button
							onClick={() => setActiveTab("overview")}
							className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-300 ${
								activeTab === "overview"
									? "bg-slate-900 text-white shadow-md"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<BarChart3 className="w-3.5 h-3.5" />
							<span>Aperçu</span>
						</button>
						<button
							onClick={() => setActiveTab("create")}
							className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-300 ${
								activeTab === "create"
									? "bg-slate-900 text-white shadow-md"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<Plus className="w-3.5 h-3.5" />
							<span>{editingId ? "Modifier" : "Composer"}</span>
						</button>
						<button
							onClick={() => setActiveTab("subscribers")}
							className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-300 ${
								activeTab === "subscribers"
									? "bg-slate-900 text-white shadow-md"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<Users className="w-3.5 h-3.5" />
							<span>Abonnés</span>
						</button>
					</div>
				</div>

				{/* Global Stats Bar */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
					<MiniMetric
						label="Total Abonnés"
						value={stats.totalSubscribers}
						icon={Users}
						color="emerald"
					/>
					<MiniMetric
						label="Newsletters Envoyées"
						value={stats.sentNewsletters}
						icon={Send}
						color="blue"
					/>
					<MiniMetric
						label="Taux d'ouverture"
						value={`${stats.openRate || "0.0"}%`}
						icon={TrendingUp}
						color="amber"
					/>
					<MiniMetric
						label="Total Emails"
						value={stats.sentNewsletters * stats.totalSubscribers}
						icon={Mail}
						color="indigo"
					/>
				</div>

				{/* Content */}
				{activeTab === "create" && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Form Column */}
						<div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-sm">
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-lg font-black text-slate-900 tracking-tight">
									{editingId ? "Modifier Newsletter" : "Nouvelle Newsletter"}
								</h2>
								{editingId && (
									<button
										onClick={cancelEdit}
										className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
										title="Annuler"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
										Sujet
									</label>
									<input
										type="text"
										value={formData.subject}
										onChange={(e) =>
											setFormData({ ...formData, subject: e.target.value })
										}
										className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-slate-700 transition-all text-xs"
										required
										placeholder="Entrez le sujet de votre newsletter..."
									/>
								</div>

								<div>
									<label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
										Image d'en-tête
									</label>
									<div className="flex items-center gap-3">
										<label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center transition-all group">
											<div className="flex flex-col items-center gap-1">
												<ImageIcon className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
												<span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">
													{uploading ? "Upload..." : "Choisir une image"}
												</span>
											</div>
											<input
												type="file"
												className="hidden"
												accept="image/*"
												onChange={handleImageUpload}
											/>
										</label>
										{imageUrl && (
											<div className="h-20 w-20 relative rounded-xl overflow-hidden shadow-md">
												<img
													src={imageUrl}
													alt="Preview"
													className="h-full w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => setImageUrl("")}
													className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 hover:bg-red-600 transition-colors"
												>
													<Trash2 className="h-2.5 w-2.5" />
												</button>
											</div>
										)}
									</div>
								</div>

								<div>
									<label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
										Contenu (Markdown)
									</label>
									<SimpleTextEditor
										value={formData.originalContent || ""}
										onChange={handleEditorChange}
										placeholder="Rédigez votre newsletter en Markdown..."
									/>
								</div>

								<div className="pt-2">
									<button
										type="submit"
										className="w-full flex justify-center items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all duration-300 shadow-lg"
									>
										<Send className="h-3.5 w-3.5 mr-2" />
										{editingId ? "Mettre à jour" : "Enregistrer le brouillon"}
									</button>
								</div>
							</form>
						</div>

						{/* Preview Column */}
						<div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 overflow-y-auto max-h-[700px] shadow-inner">
							<h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
								<FileText className="h-3 w-3 mr-1.5" /> Aperçu Email Mobile /
								Desktop
							</h3>

							{/* Email Simulator Container */}
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-[500px] mx-auto border border-slate-100 scale-95 origin-top">
								{/* Email Header/Subject */}
								<div className="bg-slate-50 p-4 border-b border-slate-100">
									<div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
										Sujet
									</div>
									<div className="text-base font-bold text-slate-900 break-words leading-tight">
										{formData.subject || "(Sans sujet)"}
									</div>
								</div>

								{/* Email Body */}
								<div className="p-0 bg-white min-h-[300px]">
									<div
										style={{
											fontFamily: "Arial, sans-serif",
											maxWidth: "500px",
											margin: "0 auto",
											padding: "20px",
											lineHeight: "1.5",
										}}
									>
										{/* Image Preview */}
										{imageUrl && (
											<div
												style={{ textAlign: "center", marginBottom: "20px" }}
											>
												<img
													src={imageUrl}
													alt={formData.subject}
													style={{
														maxWidth: "100%",
														height: "auto",
														borderRadius: "12px",
													}}
												/>
											</div>
										)}

										{/* Content Preview */}
										{formData.content ? (
											<div
												dangerouslySetInnerHTML={{ __html: formData.content }}
												style={{ color: "#334155", fontSize: "12px" }}
											/>
										) : (
											<div className="text-gray-300 italic text-center py-16 flex flex-col items-center gap-3">
												<Edit className="w-10 h-10 opacity-20" />
												<span className="text-xs">
													Le contenu de votre newsletter apparaîtra ici...
												</span>
											</div>
										)}

										{/* Email Footer */}
										<div
											style={{
												marginTop: "60px",
												paddingTop: "40px",
												borderTop: "1px solid #e5e7eb",
												fontSize: "14px",
												color: "#6b7280",
												textAlign: "center",
												fontFamily: "Arial, sans-serif",
											}}
										>
											<div style={{ marginBottom: "24px" }}>
												<p
													style={{
														margin: "5px 0",
														fontWeight: "bold",
														color: "#0f172a",
														fontSize: "16px",
													}}
												>
													HARVESTS
												</p>
												<p style={{ margin: "5px 0" }}>Dakar, Sénégal</p>
												<p style={{ margin: "5px 0" }}>
													<a
														href="mailto:contact@harvests.site"
														onClick={(e) => e.preventDefault()}
														style={{
															color: "#64748b",
															textDecoration: "none",
														}}
													>
														contact@harvests.site
													</a>
													{" | "}
													<span style={{ color: "#64748b" }}>
														+221 771970713
													</span>
													{" / "}
													<span style={{ color: "#64748b" }}>
														+221 774536704
													</span>
												</p>
											</div>

											<div style={{ marginBottom: "30px" }}>
												<a
													href={`${getConfig().FRONTEND_URL}/about`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#475569",
														textDecoration: "none",
														margin: "0 12px",
														fontWeight: "bold",
														fontSize: "12px",
													}}
												>
													À PROPOS
												</a>
												<a
													href={`${getConfig().FRONTEND_URL}/contact`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#475569",
														textDecoration: "none",
														margin: "0 12px",
														fontWeight: "bold",
														fontSize: "12px",
													}}
												>
													CONTACT
												</a>
												<a
													href={`${getConfig().FRONTEND_URL}/privacy`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#475569",
														textDecoration: "none",
														margin: "0 12px",
														fontWeight: "bold",
														fontSize: "12px",
													}}
												>
													CONFIDENTIALITÉ
												</a>
											</div>

											<p
												style={{
													fontSize: "12px",
													color: "#94a3b8",
													marginTop: "20px",
												}}
											>
												Vous recevez cet email car vous êtes abonné à la
												newsletter de Harvests.
												<br />
												<a
													href={`${getConfig().FRONTEND_URL}/unsubscribe`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#64748b",
														textDecoration: "underline",
													}}
												>
													Se désabonner
												</a>
											</p>

											<p
												style={{
													fontSize: "12px",
													color: "#94a3b8",
													marginTop: "10px",
												}}
											>
												&copy; {new Date().getFullYear()} Harvests. Tous droits
												réservés.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === "overview" && (
					<div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden overflow-x-auto">
						<table className="w-full border-collapse min-w-[1000px]">
							<thead className="bg-slate-50/50">
								<tr>
									<th className="px-4 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
										Sujet & Date
									</th>
									<th className="px-4 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
										Statut
									</th>
									<th className="px-4 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
										Statistiques
									</th>
									<th className="px-4 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{newsletters.length === 0 ? (
									<tr>
										<td
											colSpan="5"
											className="px-8 py-20 text-center text-slate-500 font-medium"
										>
											<div className="flex flex-col items-center gap-4">
												<Mail className="w-12 h-12 text-slate-200" />
												<p>Aucune newsletter trouvée</p>
											</div>
										</td>
									</tr>
								) : (
									newsletters.map((newsletter) => (
										<tr
											key={newsletter._id}
											className="group hover:bg-slate-50/50 transition-colors duration-300"
										>
											<td className="px-4 py-2">
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
														<Mail className="w-5 h-5" />
													</div>
													<div>
														<div className="text-sm font-black text-slate-900 mb-0.5">
															{newsletter.subject}
														</div>
														<div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
															<Clock className="w-3 h-3" />
															{formatDate(newsletter.createdAt)}
														</div>
													</div>
												</div>
											</td>
											<td className="px-4 py-2">
												<span
													className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg ${
														newsletter.status === "sent"
															? "bg-emerald-100 text-emerald-800"
															: "bg-amber-100 text-amber-800"
													}`}
												>
													{newsletter.status === "sent"
														? "Envoyé"
														: "Brouillon"}
												</span>
											</td>
											<td className="px-4 py-2">
												<div className="flex items-center gap-3">
													<div className="text-center">
														<div className="text-sm font-black text-slate-900">
															{newsletter.recipientCount || "-"}
														</div>
														<div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
															Reçus
														</div>
													</div>
													<div className="text-center">
														<div className="text-sm font-black text-emerald-600">
															{newsletter.opens ? newsletter.opens.length : 0}
														</div>
														<div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
															Ouverts
														</div>
													</div>
												</div>
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center justify-start gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<button
														onClick={() => openSendModal(newsletter)}
														className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all hover:shadow-lg"
														title={
															newsletter.status === "sent"
																? "Renvoyer"
																: "Envoyer"
														}
													>
														<Send className="w-3.5 h-3.5" />
													</button>
													{newsletter.status !== "sent" && (
														<button
															onClick={() => handleEdit(newsletter)}
															className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:shadow-lg"
															title="Modifier"
														>
															<Edit className="w-3.5 h-3.5" />
														</button>
													)}
													<button
														onClick={() => handleDelete(newsletter._id)}
														className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all hover:shadow-lg"
														title="Supprimer"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}

				{activeTab === "subscribers" && (
					<div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
						<table className="w-full border-collapse min-w-[1000px]">
							<thead className="bg-slate-50/50">
								<tr>
									<th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Email
									</th>
									<th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Date d'inscription
									</th>
									<th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Statut
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{subscribers.map((sub) => (
									<tr
										key={sub._id}
										className="group hover:bg-slate-50/50 transition-colors duration-300"
									>
										<td className="px-5 py-3">
											<div className="font-bold text-slate-700">
												{sub.email}
											</div>
										</td>
										<td className="px-5 py-3">
											<div className="font-bold text-slate-500">
												{new Date(sub.createdAt).toLocaleDateString()}
											</div>
										</td>
										<td className="px-5 py-3">
											<span
												className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
													sub.isActive
														? "bg-emerald-100 text-emerald-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{sub.isActive ? "Actif" : "Désinscrit"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Send Modal */}
			{sendModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
						<div className="p-4 border-b border-slate-100 flex justify-between items-center">
							<h3 className="text-lg font-black text-slate-900">
								Envoyer "{newsletterToSend?.subject}"
							</h3>
							<button
								onClick={closeSendModal}
								className="p-1 rounded-lg hover:bg-slate-100"
							>
								<X className="w-5 h-5 text-slate-500" />
							</button>
						</div>
						<div className="p-6 overflow-y-auto">
							<div className="mb-6">
								<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
									Destinataires
								</label>
								<div className="flex gap-4">
									<label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-slate-50 transition-colors flex-1">
										<input
											type="radio"
											name="sendMode"
											value="all"
											checked={sendMode === "all"}
											onChange={() => setSendMode("all")}
											className="text-emerald-600 focus:ring-emerald-500"
										/>
										<span className="font-bold text-slate-700 text-sm">
											Tous les abonnés actifs
										</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-slate-50 transition-colors flex-1">
										<input
											type="radio"
											name="sendMode"
											value="specific"
											checked={sendMode === "specific"}
											onChange={() => setSendMode("specific")}
											className="text-emerald-600 focus:ring-emerald-500"
										/>
										<span className="font-bold text-slate-700 text-sm">
											Sélectionner manuellement
										</span>
									</label>
								</div>
							</div>

							{sendMode === "specific" && (
								<div className="animate-fadeIn">
									<div className="flex justify-between items-center mb-2">
										<input
											type="text"
											placeholder="Rechercher un abonné..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="px-3 py-2 border rounded-lg text-sm w-1/2"
										/>
										<button
											type="button"
											onClick={() =>
												handleSelectAll(
													subscribers.filter(
														(s) =>
															s.isActive &&
															s.email
																.toLowerCase()
																.includes(searchTerm.toLowerCase())
													)
												)
											}
											className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
										>
											{selectedSubscribers.size === subscribers.length
												? "Tout désélectionner"
												: "Tout sélectionner"}
										</button>
									</div>
									<div className="border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
										<table className="w-full">
											<thead className="bg-slate-50 sticky top-0">
												<tr>
													<th className="w-10 px-4 py-2 text-left">
														<CheckCircle className="w-4 h-4 text-slate-300" />
													</th>
													<th className="px-4 py-2 text-left text-xs font-bold text-slate-500">
														Email
													</th>
													<th className="px-4 py-2 text-left text-xs font-bold text-slate-500">
														Date
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-50">
												{subscribers
													.filter(
														(sub) =>
															sub.isActive &&
															sub.email
																.toLowerCase()
																.includes(searchTerm.toLowerCase())
													)
													.map((sub) => (
														<tr
															key={sub._id}
															className="hover:bg-slate-50 cursor-pointer"
															onClick={() => toggleSubscriber(sub._id)}
														>
															<td className="px-4 py-3">
																<div
																	className={`w-4 h-4 rounded border flex items-center justify-center ${
																		selectedSubscribers.has(sub._id)
																			? "bg-emerald-500 border-emerald-500"
																			: "border-slate-300"
																	}`}
																>
																	{selectedSubscribers.has(sub._id) && (
																		<CheckCircle className="w-3 h-3 text-white" />
																	)}
																</div>
															</td>
															<td className="px-4 py-3 text-sm font-medium text-slate-700">
																{sub.email}
															</td>
															<td className="px-4 py-3 text-xs text-slate-500">
																{new Date(sub.createdAt).toLocaleDateString()}
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
									<p className="text-right text-xs text-slate-400 mt-2">
										{selectedSubscribers.size} abonnés sélectionnés
									</p>
								</div>
							)}
						</div>
						<div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
							<button
								onClick={closeSendModal}
								className="px-4 py-2 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 rounded-lg transition-colors"
							>
								Annuler
							</button>
							<button
								onClick={confirmSend}
								className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-600 transition-colors shadow-lg flex items-center gap-2"
							>
								<Send className="w-4 h-4" />
								Envoyer
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminNewsletter;
