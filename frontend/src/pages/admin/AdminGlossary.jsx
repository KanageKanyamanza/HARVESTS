import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Languages,
	Search,
	Plus,
	Edit2,
	Trash2,
	Save,
	X,
	AlertCircle,
	Play,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Jour 46 (bascule bilingue) - gestion du glossaire de traduction fr -> en
// utilisé par la traduction automatique des produits/plats/blogs
// (backend/utils/translateText.js). UI en français comme le reste du
// back-office.

const TYPE_LABELS = {
	exact: "Terme exact",
	replacement: "Remplacement",
};

const EMPTY_FORM = {
	type: "exact",
	source: "",
	target: "",
	flags: "gi",
	note: "",
};

const inputClass =
	"w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all";
const labelClass =
	"block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5";

const getErrorMessage = (error, fallback) =>
	error?.response?.data?.message || fallback;

// Même contrôle que le backend, pour un retour immédiat dans le formulaire
const validateRegex = (pattern, flags) => {
	try {
		new RegExp(pattern, flags || "gi");
		return null;
	} catch (error) {
		return `Expression régulière invalide : ${error.message}`;
	}
};

const AdminGlossary = () => {
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingEntry, setEditingEntry] = useState(null);
	const [formData, setFormData] = useState(EMPTY_FORM);
	const [formError, setFormError] = useState(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [testText, setTestText] = useState("");
	const [testResult, setTestResult] = useState(null);
	const [testLoading, setTestLoading] = useState(false);

	const loadEntries = useCallback(async () => {
		try {
			setLoading(true);
			setLoadError(null);
			const response = await adminService.getGlossaryEntries();
			if (response.status === "success") {
				setEntries(response.data.entries);
			}
		} catch (error) {
			console.error("Error loading glossary:", error);
			setLoadError(getErrorMessage(error, "Impossible de charger le glossaire"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadEntries();
	}, [loadEntries]);

	// Le glossaire reste petit : filtrage côté client, pas de requête par frappe
	const filteredEntries = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		return entries.filter((entry) => {
			if (typeFilter !== "all" && entry.type !== typeFilter) return false;
			if (!term) return true;
			return [entry.source, entry.target, entry.note]
				.filter(Boolean)
				.some((value) => value.toLowerCase().includes(term));
		});
	}, [entries, searchTerm, typeFilter]);

	const counts = useMemo(
		() => ({
			exact: entries.filter((e) => e.type === "exact").length,
			replacement: entries.filter((e) => e.type === "replacement").length,
		}),
		[entries],
	);

	const handleOpenModal = (entry = null) => {
		setEditingEntry(entry);
		setFormData(
			entry
				? {
						type: entry.type,
						source: entry.source,
						target: entry.target,
						flags: entry.flags || "gi",
						note: entry.note || "",
					}
				: EMPTY_FORM,
		);
		setFormError(null);
		setIsModalOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError(null);

		if (formData.type === "replacement") {
			const regexError = validateRegex(formData.source, formData.flags);
			if (regexError) {
				setFormError(regexError);
				return;
			}
		}

		const data = {
			type: formData.type,
			source: formData.source.trim(),
			target: formData.target.trim(),
			note: formData.note.trim(),
			...(formData.type === "replacement" && { flags: formData.flags }),
		};

		setActionLoading(true);
		try {
			if (editingEntry) {
				await adminService.updateGlossaryEntry(editingEntry._id, data);
			} else {
				await adminService.createGlossaryEntry(data);
			}
			setIsModalOpen(false);
			loadEntries();
		} catch (error) {
			console.error("Error saving glossary entry:", error);
			setFormError(getErrorMessage(error, "Erreur lors de l'enregistrement"));
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async (entry) => {
		if (
			!window.confirm(
				`Supprimer l'entrée « ${entry.source} → ${entry.target} » du glossaire ?`,
			)
		)
			return;
		setActionLoading(true);
		try {
			await adminService.deleteGlossaryEntry(entry._id);
			loadEntries();
		} catch (error) {
			console.error("Error deleting glossary entry:", error);
			setLoadError(getErrorMessage(error, "Erreur lors de la suppression"));
		} finally {
			setActionLoading(false);
		}
	};

	const handleTest = async (e) => {
		e.preventDefault();
		if (!testText.trim()) return;
		setTestLoading(true);
		setTestResult(null);
		try {
			const response = await adminService.translateText(testText, "fr", "en");
			setTestResult({
				text: response.data?.translatedText,
				warning: response.data?.warning,
			});
		} catch (error) {
			setTestResult({
				warning: getErrorMessage(error, "Erreur lors de la traduction"),
			});
		} finally {
			setTestLoading(false);
		}
	};

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background Effect */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
					<div>
						<div className="flex items-center gap-2 text-purple-600 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
							<div className="w-5 h-[2px] bg-purple-600"></div>
							<span>Traduction automatique FR → EN</span>
						</div>
						<h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
							Glossaire de <span className="text-purple-600">traduction</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl">
							Corrige le vocabulaire local que la traduction automatique rend
							mal (ex. « corète » → « jute mallow »). Les changements
							s'appliquent aux prochaines traductions de produits, plats et
							articles ; les traductions déjà enregistrées ne sont pas
							modifiées.
						</p>
					</div>
					<button
						onClick={() => handleOpenModal()}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20 self-start md:self-auto"
					>
						<Plus className="h-4 w-4" /> Nouvelle entrée
					</button>
				</div>

				{/* Test de traduction */}
				<form
					onSubmit={handleTest}
					className="bg-white/70 backdrop-blur-xl p-3 rounded-2xl border border-white/60 shadow-sm mb-4"
				>
					<label className={labelClass}>Tester une traduction</label>
					<div className="flex flex-col sm:flex-row gap-2">
						<input
							type="text"
							value={testText}
							onChange={(e) => setTestText(e.target.value)}
							className={inputClass}
							placeholder="Ex : Sauce de corète potagère au soumbala"
						/>
						<button
							type="submit"
							disabled={testLoading || !testText.trim()}
							className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
						>
							{testLoading ? (
								<LoadingSpinner size="sm" color="white" />
							) : (
								<>
									<Play className="h-3.5 w-3.5" /> Traduire
								</>
							)}
						</button>
					</div>
					{testResult && (
						<div className="mt-2 text-sm">
							{testResult.text && (
								<p className="text-gray-900">
									<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">
										EN
									</span>
									{testResult.text}
								</p>
							)}
							{testResult.warning && (
								<p className="text-xs text-amber-600 mt-1">
									{testResult.warning}
								</p>
							)}
						</div>
					)}
				</form>

				{/* Filters */}
				<div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-xl p-1.5 rounded-xl border border-white/60 shadow-sm mb-4">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
						<input
							type="text"
							placeholder="Rechercher un terme..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8 pr-4 py-1.5 bg-gray-100/50 border border-transparent focus:border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 rounded-lg text-xs font-medium w-full transition-all"
						/>
					</div>
					<select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
						className="pl-3 pr-8 py-1.5 bg-gray-100/50 border border-transparent focus:border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 rounded-lg text-xs font-medium appearance-none cursor-pointer"
					>
						<option value="all">Tous les types ({entries.length})</option>
						<option value="exact">Termes exacts ({counts.exact})</option>
						<option value="replacement">
							Remplacements ({counts.replacement})
						</option>
					</select>
				</div>

				{loadError && (
					<div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
						<AlertCircle className="h-4 w-4 flex-shrink-0" />
						{loadError}
					</div>
				)}

				{/* Table */}
				{loading ? (
					<div className="flex justify-center p-8">
						<LoadingSpinner size="lg" text="Chargement..." />
					</div>
				) : (
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50/50 border-b border-gray-100">
									<tr>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-600 uppercase tracking-widest">
											Type
										</th>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-600 uppercase tracking-widest">
											Français / motif
										</th>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-600 uppercase tracking-widest">
											Anglais
										</th>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-600 uppercase tracking-widest">
											Note
										</th>
										<th className="px-4 py-3 text-right text-[9px] font-black text-gray-600 uppercase tracking-widest">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{filteredEntries.length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="px-4 py-8 text-center text-xs text-gray-400"
											>
												{entries.length === 0
													? "Le glossaire est vide."
													: "Aucune entrée ne correspond à la recherche."}
											</td>
										</tr>
									)}
									{filteredEntries.map((entry) => (
										<tr
											key={entry._id}
											className="hover:bg-gray-50/50 transition-colors"
										>
											<td className="px-4 py-3 whitespace-nowrap">
												<span
													className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
														entry.type === "exact"
															? "bg-purple-50 text-purple-600"
															: "bg-amber-50 text-amber-700"
													}`}
												>
													{TYPE_LABELS[entry.type]}
												</span>
											</td>
											<td className="px-4 py-3">
												{entry.type === "replacement" ? (
													<code className="text-xs font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
														/{entry.source}/{entry.flags}
													</code>
												) : (
													<p className="text-xs font-bold text-gray-900">
														{entry.source}
													</p>
												)}
											</td>
											<td className="px-4 py-3">
												<p className="text-xs text-gray-700">{entry.target}</p>
											</td>
											<td className="px-4 py-3">
												<p className="text-[11px] text-gray-400 line-clamp-2">
													{entry.note}
												</p>
											</td>
											<td className="px-4 py-3">
												<div className="flex justify-end gap-1">
													<button
														onClick={() => handleOpenModal(entry)}
														title="Modifier"
														className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
													>
														<Edit2 className="h-3.5 w-3.5" />
													</button>
													<button
														onClick={() => handleDelete(entry)}
														disabled={actionLoading}
														title="Supprimer"
														className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
						<div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-in max-h-[90vh] overflow-y-auto">
							<button
								onClick={() => setIsModalOpen(false)}
								className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-lg"
							>
								<X className="h-4 w-4" />
							</button>
							<h2 className="flex items-center gap-2 text-lg font-black text-gray-900 mb-6">
								<Languages className="h-5 w-5 text-purple-600" />
								{editingEntry ? "Modifier l'entrée" : "Nouvelle entrée"}
							</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className={labelClass}>Type</label>
									<select
										value={formData.type}
										onChange={(e) =>
											setFormData({ ...formData, type: e.target.value })
										}
										className={inputClass}
									>
										<option value="exact">
											Terme exact — nom de produit entier
										</option>
										<option value="replacement">
											Remplacement — mot corrigé dans le texte traduit
										</option>
									</select>
									<p className="text-[11px] text-gray-400 mt-1">
										{formData.type === "exact"
											? "Si le texte à traduire est exactement ce terme (majuscules ignorées), la traduction ci-dessous est utilisée telle quelle, sans passer par le service automatique."
											: "Appliqué au résultat anglais de la traduction automatique : chaque correspondance du motif est remplacée. Utile quand le service traduit mal un mot au milieu d'une description."}
									</p>
								</div>
								<div>
									<label className={labelClass}>
										{formData.type === "exact"
											? "Terme français"
											: "Motif à corriger (expression régulière)"}
									</label>
									<input
										type="text"
										required
										value={formData.source}
										onChange={(e) =>
											setFormData({ ...formData, source: e.target.value })
										}
										className={`${inputClass} ${formData.type === "replacement" ? "font-mono" : ""}`}
										placeholder={
											formData.type === "exact"
												? "Ex : corète potagère"
												: "Ex : \\bgombo\\b"
										}
									/>
									{formData.type === "replacement" && (
										<p className="text-[11px] text-gray-400 mt-1">
											Encadrer le mot par <code>\b</code> pour ne remplacer que le
											mot entier (sinon « toe » corrigerait aussi « tomatoes »).
										</p>
									)}
								</div>
								<div>
									<label className={labelClass}>Traduction anglaise</label>
									<input
										type="text"
										required
										value={formData.target}
										onChange={(e) =>
											setFormData({ ...formData, target: e.target.value })
										}
										className={inputClass}
										placeholder="Ex : Jute Mallow"
									/>
								</div>
								{formData.type === "replacement" && (
									<div>
										<label className={labelClass}>Options (flags)</label>
										<input
											type="text"
											value={formData.flags}
											onChange={(e) =>
												setFormData({ ...formData, flags: e.target.value })
											}
											className={`${inputClass} font-mono`}
											placeholder="gi"
										/>
										<p className="text-[11px] text-gray-400 mt-1">
											« gi » par défaut : toutes les occurrences, sans tenir
											compte des majuscules.
										</p>
									</div>
								)}
								<div>
									<label className={labelClass}>Note (optionnel)</label>
									<input
										type="text"
										value={formData.note}
										onChange={(e) =>
											setFormData({ ...formData, note: e.target.value })
										}
										className={inputClass}
										placeholder="Ex : MyMemory traduisait « corte »"
									/>
								</div>

								{formError && (
									<div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium">
										<AlertCircle className="h-4 w-4 flex-shrink-0" />
										{formError}
									</div>
								)}

								<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="px-4 py-2 text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 rounded-lg transition-all"
									>
										Annuler
									</button>
									<button
										type="submit"
										disabled={actionLoading}
										className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{actionLoading ? (
											<LoadingSpinner size="sm" color="white" />
										) : (
											<>
												<Save className="h-4 w-4" /> Enregistrer
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminGlossary;
