import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	Mail,
	Users,
	Search,
	Download,
	Calendar,
	Filter,
	ChevronLeft,
	ChevronRight,
	Send,
	Upload,
    Trash2,
    RefreshCw,
    Plus,
} from "lucide-react";
import { getConfig } from "../../config/production";
import { useDebounce } from "../../hooks/useDebounce";

const AdminContacts = () => {
	const navigate = useNavigate();
	const [contacts, setContacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 1,
	});

	const { API_BASE_URL } = getConfig();
	const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const fetchContacts = useCallback(async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("harvests_token");
			const params = new URLSearchParams({
				page: pagination.page,
				limit: pagination.limit,
				search: debouncedSearchTerm,
				source: sourceFilter,
			});

			const response = await fetch(`${baseUrl}/api/v1/mailing-contacts?${params}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.status === "success") {
				setContacts(data.data.contacts);
				setPagination((prev) => ({
					...prev,
					total: data.pagination.total,
					pages: data.pagination.pages,
				}));
			}
		} catch (error) {
			console.error("Erreur lors de la récupération des contacts:", error);
		} finally {
			setLoading(false);
		}
	}, [pagination.page, pagination.limit, debouncedSearchTerm, sourceFilter, baseUrl]);

	useEffect(() => {
		fetchContacts();
	}, [fetchContacts]);

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.pages) {
			setPagination((prev) => ({ ...prev, page: newPage }));
		}
	};

	const exportToCSV = () => {
		const headers = ["Email", "Prénom", "Nom", "Entreprise", "Source", "Date d'Ajout"];
		const rows = contacts.map((contact) => [
			contact.email,
			contact.firstName || "",
			contact.lastName || "",
			contact.companyName || "",
			contact.source || "manual",
			new Date(contact.createdAt).toLocaleDateString("fr-FR"),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `contacts_mailing_${new Date().toISOString().split("T")[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

		try {
			const token = localStorage.getItem("harvests_token");
			const response = await fetch(`${baseUrl}/api/v1/mailing-contacts/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				fetchContacts();
			}
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
		}
	};

	const handleSendToSelected = () => {
		if (selectedContacts.length === 0) {
			alert("Veuillez sélectionner au moins un contact");
			return;
		}

		navigate("/admin/email-composer", {
			state: {
				userIds: selectedContacts,
				emails: contacts
					.filter((c) => selectedContacts.includes(c._id))
					.map((c) => c.email),
			},
		});
	};

	const getStatusBadge = (isActive) => (
		<span
			className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
				isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
			}`}
		>
			{isActive ? "Actif" : "Inactif"}
		</span>
	);

	const getSourceBadge = (source) => {
		const styles = {
			manual: "bg-slate-100 text-slate-700",
			import: "bg-amber-100 text-amber-700",
		};
		return (
			<span
				className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
					styles[source] || "bg-slate-100 text-slate-700"
				}`}
			>
				{source === "import" ? "Importé" : "Manuel"}
			</span>
		);
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
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-1">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>CRM & Mailing</span>
						</div>
						<h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter leading-none">
							Mes Contacts{" "}
							<span className="text-emerald-500 text-stroke-thin italic">
								Mailing
							</span>
						</h1>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => navigate("/admin/email-composer")}
							className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200"
						>
							<Plus className="w-4 h-4" />
							<span>Nouveau Mail</span>
						</button>
						<button
							onClick={() => navigate("/admin/email-import")}
							className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
						>
							<Upload className="w-4 h-4" />
							<span>Importer</span>
						</button>
						<button
							onClick={exportToCSV}
							className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
						>
							<Download className="w-4 h-4" />
							<span>Exporter</span>
						</button>
					</div>
				</div>

				{/* Quick Stats & Filters */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
					{/* Search */}
					<div className="lg:col-span-2 relative">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
							<Search className="h-4 w-4 text-slate-400" />
						</div>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Rechercher par email, nom, entreprise..."
							className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-slate-700 transition-all text-xs shadow-sm"
						/>
					</div>

					{/* Source Filter */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
							<Filter className="h-4 w-4 text-slate-400" />
						</div>
						<select
							value={sourceFilter}
							onChange={(e) => setSourceFilter(e.target.value)}
							className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-slate-700 transition-all text-xs shadow-sm appearance-none"
						>
							<option value="">Toutes les sources</option>
							<option value="manual">Manuel</option>
							<option value="import">Importé</option>
						</select>
					</div>

					{/* Send to selected button */}
					<button
						onClick={handleSendToSelected}
						disabled={selectedContacts.length === 0}
						className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
							selectedContacts.length > 0
								? "bg-emerald-500 text-white shadow-emerald-100 hover:bg-emerald-600 active:scale-95"
								: "bg-slate-200 text-slate-400 cursor-not-allowed"
						}`}
					>
						<Send className="w-4 h-4" />
						<span>Envoyer à ({selectedContacts.length})</span>
					</button>
				</div>

				{/* Contacts Table */}
				<div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-slate-100 bg-slate-50/50">
									<th className="px-6 py-4">
										<input
											type="checkbox"
											checked={
												contacts.length > 0 &&
												selectedContacts.length === contacts.length
											}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedContacts(contacts.map((c) => c._id));
												} else {
													setSelectedContacts([]);
												}
											}}
											className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
										/>
									</th>
									<th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Contact
									</th>
									<th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
										Source / Statut
									</th>
									<th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Dernier Email
									</th>
									<th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{loading && contacts.length === 0 ? (
									<tr>
										<td colSpan="5" className="px-6 py-20 text-center">
											<div className="flex flex-col items-center gap-3">
												<RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
												<p className="text-sm font-bold text-slate-400">
													Chargement des contacts...
												</p>
											</div>
										</td>
									</tr>
								) : contacts.length === 0 ? (
									<tr>
										<td colSpan="5" className="px-6 py-20 text-center">
											<div className="flex flex-col items-center gap-4">
												<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
													<Users className="w-8 h-8" />
												</div>
												<p className="text-sm font-bold text-slate-400">
													Aucun contact trouvé
												</p>
											</div>
										</td>
									</tr>
								) : (
									contacts.map((contact) => (
										<tr
											key={contact._id}
											className={`group hover:bg-emerald-50/30 transition-colors ${
												selectedContacts.includes(contact._id)
													? "bg-emerald-50/50"
													: ""
											}`}
										>
											<td className="px-6 py-4">
												<input
													type="checkbox"
													checked={selectedContacts.includes(contact._id)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedContacts([
																...selectedContacts,
																contact._id,
															]);
														} else {
															setSelectedContacts(
																selectedContacts.filter(
																	(id) => id !== contact._id
																)
															);
														}
													}}
													className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
												/>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
														<Mail className="w-5 h-5" />
													</div>
													<div>
														<div className="text-sm font-black text-slate-900 leading-none mb-1">
															{contact.firstName || contact.lastName
																? `${contact.firstName} ${contact.lastName}`.trim()
																: "Sans nom"}
														</div>
														<div className="text-[11px] font-bold text-slate-400">
															{contact.email}
														</div>
														{contact.companyName && (
															<div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
																{contact.companyName}
															</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-1.5">
													{getSourceBadge(contact.source)}
													{getStatusBadge(contact.isActive)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
													<Calendar className="w-3.5 h-3.5 text-slate-300" />
													{contact.lastEmailedAt
														? new Date(contact.lastEmailedAt).toLocaleDateString(
																"fr-FR"
														  )
														: "Jamais"}
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() =>
															navigate("/admin/email-composer", {
																state: {
																	userIds: [contact._id],
																	emails: [contact.email],
																},
															})
														}
														className="p-2 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
														title="Lui envoyer un mail"
													>
														<Send className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDelete(contact._id)}
														className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
														title="Supprimer"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					{pagination.pages > 1 && (
						<div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
							<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
								Affichage de {contacts.length} sur {pagination.total} total
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={pagination.page === 1}
									className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors"
								>
									<ChevronLeft className="w-4 h-4" />
								</button>
								<div className="flex items-center gap-1">
									{[...Array(pagination.pages)].map((_, i) => (
										<button
											key={i}
											onClick={() => handlePageChange(i + 1)}
											className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
												pagination.page === i + 1
													? "bg-slate-900 text-white shadow-md shadow-slate-200"
													: "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
											}`}
										>
											{i + 1}
										</button>
									))}
								</div>
								<button
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={pagination.page === pagination.pages}
									className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors"
								>
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminContacts;

// Force rebuild 2026-04-15
