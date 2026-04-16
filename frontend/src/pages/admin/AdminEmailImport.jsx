import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Upload,
	FileText,
	Mail,
	User,
	AlertCircle,
	CheckCircle,
	X,
	Plus,
    Trash2,
    Users,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import { getConfig } from "../../config/production";

// Force refresh
const AdminEmailImport = () => {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	
	const [activeTab, setActiveTab] = useState("file"); // file or manual
	const [manualText, setManualText] = useState("");
	const [parsedContacts, setParsedContacts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [importStats, setImportStats] = useState(null);
	const [existingEmails, setExistingEmails] = useState(new Set());

	const { API_BASE_URL } = getConfig();
	const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

    const fetchExistingEmails = useCallback(async () => {
		try {
			const token = localStorage.getItem("harvests_token");
			const response = await fetch(`${baseUrl}/api/v1/mailing-contacts/emails-only`, {
				headers: { Authorization: `Bearer ${token}` }
			});
            const data = await response.json();
			if (data.status === "success") {
				setExistingEmails(new Set(data.emails.map(e => String(e).toLowerCase())));
			}
		} catch (error) {
			console.error("Error fetching existing emails:", error);
		}
	}, [baseUrl]);

	useEffect(() => {
		fetchExistingEmails();
	}, [fetchExistingEmails]);

	const isValidEmail = (email) => {
		return String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);
	};

	const handleManualParse = () => {
		if (!manualText.trim()) return;

		const lines = manualText.split(/[\n,;]/);
		const newContacts = [];
		const seenEmails = new Set(parsedContacts.map(c => c.email.toLowerCase()));
		let skippedCount = 0;

		lines.forEach(line => {
			const trimmed = line.trim();
			if (!trimmed) return;

			const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
			if (emailMatch) {
				const email = emailMatch[0].toLowerCase();
				
				if (existingEmails.has(email)) {
					skippedCount++;
					return;
				}

				if (!seenEmails.has(email)) {
					let firstName = "";
					let lastName = "";
					
					const namePart = trimmed.replace(email, "").replace(/[<>()[\]]/g, "").trim();
					if (namePart) {
						const parts = namePart.split(/\s+/);
						firstName = parts[0];
						lastName = parts.slice(1).join(" ");
					}

					newContacts.push({ email, firstName, lastName, source: "manual" });
					seenEmails.add(email);
				} else {
                    skippedCount++;
                }
			}
		});

		if (newContacts.length === 0) {
			alert(skippedCount > 0 ? `${skippedCount} contact(s) ignoré(s) (déjà présents).` : "Aucun email valide trouvé.");
		} else {
			setParsedContacts([...parsedContacts, ...newContacts]);
			setManualText("");
            if (skippedCount > 0) alert(`${newContacts.length} ajoutés, ${skippedCount} ignorés.`);
		}
	};

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (evt) => {
			try {
				const bstr = evt.target.result;
				const wb = XLSX.read(bstr, { type: "binary" });
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

				if (data.length < 1) {
					alert("Le fichier est vide");
					return;
				}

				const headers = data[0].map(h => String(h).toLowerCase());
				const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
				const firstNameIdx = headers.findIndex(h => h.includes("prenom") || h.includes("first") || h.includes("prénom"));
				const lastNameIdx = headers.findIndex(h => h.includes("nom") || h.includes("last"));

				if (emailIdx === -1) {
					alert("Impossible de trouver une colonne 'Email' dans le fichier.");
					return;
				}

				const newContacts = [];
				const seenEmails = new Set(parsedContacts.map(c => c.email.toLowerCase()));
				let skippedCount = 0;

				for (let i = 1; i < data.length; i++) {
					const row = data[i];
					const email = String(row[emailIdx] || "").trim().toLowerCase();
					
					if (email && isValidEmail(email)) {
						if (existingEmails.has(email) || seenEmails.has(email)) {
							skippedCount++;
							continue;
						}

						newContacts.push({
							email,
							firstName: firstNameIdx !== -1 ? String(row[firstNameIdx] || "").trim() : "",
							lastName: lastNameIdx !== -1 ? String(row[lastNameIdx] || "").trim() : "",
							source: "file"
						});
						seenEmails.add(email);
					}
				}

				if (newContacts.length === 0) {
					alert(skippedCount > 0 ? `${skippedCount} contact(s) déjà présent(s) ignoré(s).` : "Aucun nouvel email valide trouvé.");
				} else {
					setParsedContacts([...parsedContacts, ...newContacts]);
                    if (skippedCount > 0) alert(`${newContacts.length} chargés, ${skippedCount} ignorés.`);
				}
			} catch (err) {
				console.error("Excel parse error:", err);
				alert("Erreur lors de la lecture du fichier.");
			}
		};
		reader.readAsBinaryString(file);
		e.target.value = null;
	};

	const removeContact = (index) => {
		const updated = [...parsedContacts];
		updated.splice(index, 1);
		setParsedContacts(updated);
	};

	const handleImport = async () => {
		if (parsedContacts.length === 0) return;

		try {
			setLoading(true);
			const token = localStorage.getItem("harvests_token");
			const response = await fetch(`${baseUrl}/api/v1/mailing-contacts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ contacts: parsedContacts })
			});

			const data = await response.json();

			if (data.status === "success") {
				setImportStats(data.stats);
				setParsedContacts([]);
				alert(data.message);
				fetchExistingEmails();
			}
		} catch (error) {
			console.error("Import error:", error);
			alert("Erreur lors de l'importation.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="pb-20 relative overflow-hidden">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/20 rounded-full blur-[100px]"></div>
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
								Importation de{" "}
								<span className="text-emerald-500 text-stroke-thin italic">
									Contacts
								</span>
							</h1>
						</div>

						<div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm">
							<button
								onClick={() => setActiveTab("file")}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
									activeTab === "file"
										? "bg-slate-900 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-50"
								}`}
							>
								<Upload className="w-3.5 h-3.5" />
								<span>Fichier Excel/CSV</span>
							</button>
							<button
								onClick={() => setActiveTab("manual")}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
									activeTab === "manual"
										? "bg-slate-900 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-50"
								}`}
							>
								<Plus className="w-3.5 h-3.5" />
								<span>Saisie Manuelle</span>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column: Input Method */}
						<div className="lg:col-span-1 space-y-6">
							<div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl shadow-slate-200/50">
								{activeTab === "file" ? (
									<div className="space-y-6">
										<div className="text-center">
											<div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
												<FileText className="w-8 h-8" />
											</div>
											<h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Téléverser un fichier</h3>
											<p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Excel (.xlsx) ou CSV</p>
										</div>

										<div 
											onClick={() => fileInputRef.current?.click()}
											className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
										>
											<Upload className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors mb-4" />
											<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-emerald-600 transition-colors">
												Cliquez pour choisir un fichier
											</p>
											<input 
												type="file" 
												ref={fileInputRef}
												onChange={handleFileUpload}
												accept=".xlsx, .xls, .csv"
												className="hidden"
											/>
										</div>

										<div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
											<h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
												<AlertCircle className="w-3 h-3 text-emerald-500" /> Format requis
											</h4>
											<p className="text-[10px] font-bold text-slate-500 leading-relaxed">
												Le fichier doit contenir au moins une colonne <span className="text-slate-900 font-black">"Email"</span>. Les colonnes "Prénom", "Nom" et "Entreprise" sont optionnelles.
											</p>
										</div>
									</div>
								) : (
									<div className="space-y-6">
										<div className="text-center">
											<div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
												<Mail className="w-8 h-8" />
											</div>
											<h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Saisie Manuelle</h3>
											<p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Collez vos emails ici</p>
										</div>

										<textarea
											rows={8}
											value={manualText}
											onChange={(e) => setManualText(e.target.value)}
											placeholder="Ex: jean@email.com, Marie <marie@test.com>..."
											className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-slate-700 transition-all text-sm shadow-sm resize-none"
										/>

										<button
											onClick={handleManualParse}
											disabled={!manualText.trim()}
											className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl shadow-slate-200"
										>
											Ajouter à la liste
										</button>
									</div>
								)}
							</div>

							{importStats && (
								<div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-lg shadow-emerald-50/50">
									<h3 className="text-emerald-800 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
										<CheckCircle className="w-5 h-5" />
										Importation Terminée
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between items-center py-2 border-b border-emerald-100">
											<span className="text-[10px] font-black text-emerald-600 uppercase">Importés :</span>
											<span className="text-sm font-black text-emerald-900">{importStats.imported}</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-emerald-100">
											<span className="text-[10px] font-black text-emerald-600 uppercase">Mis à jour :</span>
											<span className="text-sm font-black text-emerald-900">{importStats.updated}</span>
										</div>
										{importStats.failed > 0 && (
											<div className="flex justify-between items-center py-2">
												<span className="text-[10px] font-black text-red-600 uppercase">Échecs :</span>
												<span className="text-sm font-black text-red-700">{importStats.failed}</span>
											</div>
										)}
									</div>
									<button
										onClick={() => setImportStats(null)}
										className="w-full mt-6 py-2 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest"
									>
										Nouvel import
									</button>
								</div>
							)}
						</div>

						{/* Right Column: Preview & Final Action */}
						<div className="lg:col-span-2 space-y-6">
							<div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl flex flex-col h-[650px] shadow-xl shadow-slate-200/50 overflow-hidden">
								<div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-xl">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
											<Users className="w-5 h-5" />
										</div>
										<div>
											<h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">
												Contacts en attente ({parsedContacts.length})
											</h2>
											<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vérifiez les données avant de valider</p>
										</div>
									</div>
									{parsedContacts.length > 0 && (
										<button
											onClick={() => setParsedContacts([])}
											className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest underline underline-offset-4"
										>
											Tout effacer
										</button>
									)}
								</div>

								<div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
									{parsedContacts.length === 0 ? (
										<div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
											<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
												<Mail className="w-10 h-10 opacity-20" />
											</div>
											<p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center max-w-[200px]">
												Ajoutez des contacts pour commencer
											</p>
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{parsedContacts.map((contact, index) => (
												<div 
													key={index}
													className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group relative"
												>
													<div className="flex items-center gap-4 min-w-0">
														<div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
															<User className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
														</div>
														<div className="min-w-0">
															<div className="text-xs font-black text-slate-900 truncate leading-none mb-1">
																{contact.firstName || contact.lastName 
																	? `${contact.firstName} ${contact.lastName}`.trim()
																	: "Contact Sans Nom"}
															</div>
															<div className="text-[10px] font-bold text-slate-400 truncate tracking-wide">{contact.email}</div>
														</div>
													</div>
													<button
														onClick={() => removeContact(index)}
														className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{parsedContacts.length > 0 && (
									<div className="p-8 border-t border-slate-50 bg-slate-50/30">
										<div className="flex flex-col sm:flex-row gap-4">
											<button
												onClick={() => setParsedContacts([])}
												className="flex-1 p-4 border border-slate-200 bg-white text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
											>
												Annuler
											</button>
											<button
												onClick={handleImport}
												disabled={loading || parsedContacts.length === 0}
												className="flex-[2] p-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:bg-slate-200 shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
											>
												{loading ? (
													<RefreshCw className="w-5 h-5 animate-spin" />
												) : (
													<CheckCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
												)}
												<span>{loading ? "Importation..." : `Valider l'import de ${parsedContacts.length} contacts`}</span>
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Footer Info / Tutorial */}
					<div className="mt-8 bg-white/50 backdrop-blur-xl border border-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-200/50">
						<div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm shrink-0">
							<ChevronRight className="w-8 h-8" />
						</div>
						<div className="space-y-1">
							<h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Comment bien importer vos contacts ?</h4>
							<p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
								Les doublons déjà présents en base de données (<span className="text-emerald-600">{existingEmails.size} emails</span>) sont automatiquement détectés et ignorés pour éviter toute pollution. Vous pouvez glisser-déposer vos fichiers directement sur la zone de clic.
							</p>
						</div>
					</div>
				</div>
		</div>
	);
};

export default AdminEmailImport;

// Force rebuild 2026-04-15
