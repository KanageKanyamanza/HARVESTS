import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	BarChart3,
	ArrowLeft,
	Filter,
	Download,
	RefreshCw,
	Calendar,
	Globe,
	Monitor,
	Smartphone,
	Tablet,
	Eye,
	Heart,
	TrendingUp,
	Layers,
	ChevronRight,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useNotifications } from "../../contexts/NotificationContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminBlogAnalytics = () => {
	const navigate = useNavigate();
	const { showError, showSuccess } = useNotifications();
	const [loading, setLoading] = useState(true);
	const [visits, setVisits] = useState([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pages: 1,
		total: 0,
	});
	const [filters, setFilters] = useState({
		blogId: "",
		country: "",
		deviceType: "",
		dateFrom: "",
		dateTo: "",
	});
	const [blogs, setBlogs] = useState([]);
	const [stats, setStats] = useState({
		totalVisits: 0,
		uniqueVisitors: 0,
		totalLikes: 0,
		deviceBreakdown: [],
		topCountries: [],
	});

	useEffect(() => {
		loadBlogs();
		loadVisits();
		loadStats();
	}, [pagination.current, filters]);

	const loadStats = async () => {
		try {
			const response = await adminService.getBlogStats();
			if (response.success && response.data) {
				setStats({
					totalVisits: response.data.tracking?.totalVisits || 0,
					uniqueVisitors: response.data.tracking?.uniqueVisitors || 0,
					totalLikes: response.data.totalLikes || 0,
					deviceBreakdown: response.data.tracking?.deviceBreakdown || [],
					topCountries: response.data.tracking?.topCountries || [],
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des stats:", error);
		}
	};

	const loadBlogs = async () => {
		try {
			const response = await adminService.getBlogs({ limit: 1000 });
			if (response.success && response.data) {
				setBlogs(response.data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des blogs:", error);
		}
	};

	const loadVisits = async () => {
		try {
			setLoading(true);
			const params = {
				page: pagination.current,
				limit: 50,
				...filters,
			};

			// Nettoyer les paramètres vides
			Object.keys(params).forEach((key) => {
				if (params[key] === "") delete params[key];
			});

			const response = await adminService.getAllBlogVisits(params);

			if (response.success) {
				setVisits(response.data || []);
				setPagination(
					response.pagination || {
						current: 1,
						pages: 1,
						total: 0,
					}
				);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des visites:", error);
			showError("Erreur lors du chargement des visites");
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const resetFilters = () => {
		setFilters({
			blogId: "",
			country: "",
			deviceType: "",
			dateFrom: "",
			dateTo: "",
		});
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const exportToCSV = () => {
		const headers = [
			"Date",
			"Prénom",
			"Nom",
			"Email",
			"Type",
			"Article",
			"Pays",
			"Région",
			"Ville",
			"Appareil",
			"Navigateur",
			"Durée (s)",
			"Scroll (%)",
			"Référent",
		];
		const rows = visits.map((visit) => [
			new Date(visit.visitedAt).toLocaleString("fr-FR"),
			visit.visitorInfo?.firstName || "Anonyme",
			visit.visitorInfo?.lastName || "",
			visit.visitorInfo?.email || "N/A",
			visit.visitorInfo?.type === "user"
				? "Membre"
				: visit.visitorInfo?.type === "lead"
				? "Prospect"
				: "Inconnu",
			visit.blog?.title?.fr || visit.blog?.title?.en || "N/A",
			visit.visitorInfo?.country || visit.country || "N/A",
			visit.visitorInfo?.region || visit.region || "N/A",
			visit.visitorInfo?.city || visit.city || "N/A",
			visit.device?.type || "N/A",
			visit.device?.browser || "N/A",
			visit.timeOnPage || 0,
			visit.scrollDepth || 0,
			visit.referrerDomain || "Direct",
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`blog-visits-${new Date().toISOString().split("T")[0]}.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		showSuccess("Export CSV réussi");
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return (
			<div className="flex flex-col">
				<span className="font-bold text-slate-900">
					{date.toLocaleDateString("fr-FR")}
				</span>
				<span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
					{date.toLocaleTimeString("fr-FR", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
		);
	};

	const getDeviceIcon = (type) => {
		switch (type?.toLowerCase()) {
			case "desktop":
				return <Monitor className="w-5 h-5 text-indigo-500" />;
			case "mobile":
				return <Smartphone className="w-5 h-5 text-emerald-500" />;
			case "tablet":
				return <Tablet className="w-5 h-5 text-amber-500" />;
			default:
				return <Monitor className="w-5 h-5 text-slate-400" />;
		}
	};

	const MetricCard = ({ title, value, icon: Icon, color }) => (
		<div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xl shadow-slate-100/50 hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden relative group">
			<div
				className={`absolute top-0 right-0 w-16 h-16 bg-${color}-500/5 rounded-full blur-xl group-hover:bg-${color}-500/10 transition-colors pointer-events-none`}
			></div>
			<div className="relative z-10">
				<div
					className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-4`}
				>
					<Icon className={`w-5 h-5 text-${color}-500`} />
				</div>
				<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
					{title}
				</p>
				<h3 className="text-2xl font-black text-slate-900 tracking-tighter">
					{value}
				</h3>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen md:pl-3 bg-[#fafafa] relative overflow-hidden">
			{/* Background Deco */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate("/admin/blog/stats")}
							className="group w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md mb-1"
						>
							<ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
						</button>
						<div>
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
								<div className="w-6 h-[2px] bg-emerald-600"></div>
								<span>Visitor Intelligence</span>
							</div>
							<h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
								Global{" "}
								<span className="text-emerald-500 text-stroke-thin">
									Analytics
								</span>
							</h1>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={loadVisits}
							className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 shadow-sm"
						>
							<RefreshCw
								className={`w-4 h-4 transition-transform group-hover:rotate-180 ${
									loading ? "animate-spin" : ""
								}`}
							/>
							<span>Actualiser</span>
						</button>
						<button
							onClick={exportToCSV}
							className="group flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-slate-200"
						>
							<Download className="w-4 h-4 transition-transform group-hover:translate-y-1" />
							<span>Exporter CSV</span>
						</button>
					</div>
				</div>

				{/* Quick Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					<MetricCard
						title="Total Page Views"
						value={stats.totalVisits?.toLocaleString() || 0}
						icon={Eye}
						color="blue"
					/>
					<MetricCard
						title="Unique Visitors"
						value={stats.uniqueVisitors?.toLocaleString() || 0}
						icon={Layers}
						color="emerald"
					/>
					<MetricCard
						title="Current Batch Sessions"
						value={pagination.total || 0}
						icon={TrendingUp}
						color="indigo"
					/>
					<MetricCard
						title="Cumulative Likes"
						value={stats.totalLikes || 0}
						icon={Heart}
						color="rose"
					/>
				</div>

				{/* Filters Glass Card */}
				<div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-5 mb-8 shadow-2xl shadow-slate-100">
					<div className="flex items-center gap-2 mb-6">
						<Filter className="w-4 h-4 text-emerald-500" />
						<h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
							Filter Audience
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
						<div className="space-y-1.5">
							<label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Publication
							</label>
							<div className="relative">
								<select
									value={filters.blogId}
									onChange={(e) => handleFilterChange("blogId", e.target.value)}
									className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									<option value="">Tous les blogs</option>
									{blogs.map((blog) => (
										<option key={blog._id} value={blog._id}>
											{blog.title?.fr || blog.title?.en || blog._id}
										</option>
									))}
								</select>
								<ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Starting From
							</label>
							<input
								type="date"
								value={filters.dateFrom}
								onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
								className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Ending At
							</label>
							<input
								type="date"
								value={filters.dateTo}
								onChange={(e) => handleFilterChange("dateTo", e.target.value)}
								className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Geo Location
							</label>
							<input
								type="text"
								value={filters.country}
								onChange={(e) => handleFilterChange("country", e.target.value)}
								placeholder="France, US..."
								className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner placeholder:text-slate-300"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Access Device
							</label>
							<div className="relative">
								<select
									value={filters.deviceType}
									onChange={(e) =>
										handleFilterChange("deviceType", e.target.value)
									}
									className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									<option value="">Tous les types</option>
									<option value="desktop">Desktop</option>
									<option value="mobile">Mobile</option>
									<option value="tablet">Tablet</option>
								</select>
								<ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
							</div>
						</div>
					</div>
					<div className="mt-8 flex justify-end">
						<button
							onClick={resetFilters}
							className="px-6 py-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
						>
							Reset All Filters
						</button>
					</div>
				</div>

				{/* Analytics Table */}
				<div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-100 overflow-hidden">
					{loading && visits.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-32 space-y-6">
							<LoadingSpinner size="lg" />
							<p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
								Synchronising stream data...
							</p>
						</div>
					) : visits.length === 0 ? (
						<div className="py-32 flex flex-col items-center justify-center text-center">
							<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
								<Layers className="w-8 h-8 text-slate-200" />
							</div>
							<h3 className="text-xl font-black text-slate-900 mb-2">
								No analytics record
							</h3>
							<p className="text-slate-400 text-sm max-w-xs leading-relaxed">
								Try adjusting your date range or publication filters to see
								results.
							</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-slate-50/50">
											<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Timestamp
											</th>
											<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Publication Article
											</th>
											<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Identity
											</th>
											<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Audience Origin
											</th>
											<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Tech Stack
											</th>
											<th className="px-5 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Retention
											</th>
											<th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">
												Acquisition
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50">
										{visits.map((visit) => (
											<tr
												key={visit._id}
												className="group hover:bg-slate-50/50 transition-colors duration-300"
											>
												<td className="px-5 py-2.5 whitespace-nowrap">
													{formatDate(visit.visitedAt)}
												</td>
												<td className="px-5 py-2.5">
													<p className="text-xs font-black text-slate-900 line-clamp-1 max-w-[200px]">
														{visit.blog?.title?.fr ||
															visit.blog?.title?.en ||
															"Article Inconnu"}
													</p>
												</td>
												<td className="px-5 py-2.5 whitespace-nowrap">
													{visit.visitorInfo ? (
														<div className="flex flex-col">
															<span className="text-xs font-bold text-slate-900">
																{visit.visitorInfo.email}
															</span>
															<span className="text-[9px] font-black text-slate-400 font-black uppercase tracking-tighter flex items-center gap-1">
																{visit.visitorInfo.firstName}{" "}
																{visit.visitorInfo.lastName}
																{visit.visitorInfo.type === "user" && (
																	<span className="px-1 py-0.5 rounded bg-blue-50 text-blue-600 ml-1">
																		MBR
																	</span>
																)}
																{visit.visitorInfo.type === "lead" && (
																	<span className="px-1 py-0.5 rounded bg-amber-50 text-amber-600 ml-1">
																		LEAD
																	</span>
																)}
															</span>
														</div>
													) : (
														<span className="text-xs font-bold text-slate-400 italic">
															Anonymous
														</span>
													)}
												</td>
												<td className="px-5 py-2.5 whitespace-nowrap">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded bg-emerald-50 flex items-center justify-center">
															<Globe className="w-3.5 h-3.5 text-emerald-500" />
														</div>
														<div className="flex flex-col">
															<span className="text-xs font-bold text-slate-700">
																{visit.visitorInfo?.country ||
																	visit.country ||
																	"Direct Access"}
															</span>
															<span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
																{visit.visitorInfo?.city ||
																	visit.city ||
																	"Region unknown"}
															</span>
														</div>
													</div>
												</td>
												<td className="px-5 py-2.5 whitespace-nowrap">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center">
															{getDeviceIcon(visit.device?.type)}
														</div>
														<div className="flex flex-col">
															<span className="text-xs font-bold text-slate-700 capitalize">
																{visit.device?.type || "Standard"}
															</span>
															<span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
																{visit.device?.browser || "Webview"}
															</span>
														</div>
													</div>
												</td>
												<td className="px-5 py-2.5 text-center whitespace-nowrap">
													<div className="flex flex-col items-center gap-0.5">
														<div className="flex items-center gap-1.5">
															<span className="text-xs font-black text-slate-900">
																{visit.timeOnPage
																	? `${Math.round(visit.timeOnPage)}s`
																	: "N/A"}
															</span>
															<div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
																<div
																	className="h-full bg-emerald-500 rounded-full"
																	style={{
																		width: `${Math.min(
																			100,
																			(visit.timeOnPage || 0) * 2
																		)}%`,
																	}}
																></div>
															</div>
														</div>
														<span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
															{visit.scrollDepth
																? `${Math.round(visit.scrollDepth)}% scroll`
																: "No interaction"}
														</span>
													</div>
												</td>
												<td className="px-5 py-2.5 text-right whitespace-nowrap">
													<div className="flex flex-col items-end">
														<span className="text-[10px] font-black text-slate-900 py-0.5 px-2 bg-slate-50 rounded group-hover:bg-white transition-colors">
															{visit.referrerDomain || "Direct traffic"}
														</span>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Premium Pagination */}
							{pagination.pages > 1 && (
								<div className="px-5 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
									<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
										Batch:{" "}
										<span className="text-slate-900">
											{(pagination.current - 1) * 50 + 1}-
											{Math.min(pagination.current * 50, pagination.total)}
										</span>{" "}
										/ {pagination.total}
									</p>
									<div className="flex gap-2">
										<button
											onClick={() =>
												setPagination((prev) => ({
													...prev,
													current: Math.max(1, prev.current - 1),
												}))
											}
											disabled={pagination.current === 1}
											className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-sm"
										>
											Précédent
										</button>
										<button
											onClick={() =>
												setPagination((prev) => ({
													...prev,
													current: Math.min(prev.pages, prev.current + 1),
												}))
											}
											disabled={pagination.current === pagination.pages}
											className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-md"
										>
											Suivant
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminBlogAnalytics;
