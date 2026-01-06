import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	BarChart3,
	FileText,
	Eye,
	Heart,
	ArrowLeft,
	TrendingUp,
	Globe,
	Smartphone,
	Users,
	Award,
	ChevronRight,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useNotifications } from "../../contexts/NotificationContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminBlogStats = () => {
	const navigate = useNavigate();
	const { showError } = useNotifications();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		total: 0,
		published: 0,
		draft: 0,
		byType: [],
		byCategory: [],
		totalViews: 0,
		totalLikes: 0,
		tracking: {
			totalVisits: 0,
			uniqueVisitors: 0,
			deviceBreakdown: [],
			topCountries: [],
		},
	});

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			setLoading(true);
			const response = await adminService.getBlogStats();

			if (response.success && response.data) {
				setStats(response.data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			showError("Erreur lors du chargement des statistiques");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-6">
				<LoadingSpinner size="lg" />
				<p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
					Analysing blog performance...
				</p>
			</div>
		);
	}

	const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
		<div className="relative group bg-white rounded-[32px] p-8 border border-slate-100 shadow-2xl shadow-slate-100/50 hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden">
			<div
				className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-${color}-500/10 transition-colors`}
			></div>
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-6">
					<div
						className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center`}
					>
						<Icon className={`w-7 h-7 text-${color}-500`} />
					</div>
					{trend && (
						<div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
							<TrendingUp className="w-3 h-3" />
							{trend}
						</div>
					)}
				</div>
				<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
					{title}
				</p>
				<h3 className="text-4xl font-black text-slate-900 tracking-tighter">
					{value}
				</h3>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
			{/* Background Decoration */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Breadcrumbs & Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
					<div className="flex items-center gap-6">
						<button
							onClick={() => navigate("/admin/blog")}
							className="group w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md mb-1"
						>
							<ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
						</button>
						<div>
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
								<div className="w-8 h-[2px] bg-emerald-600"></div>
								<span>Performance Report</span>
							</div>
							<h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
								Blog{" "}
								<span className="text-emerald-500 text-stroke-thin">Stats</span>
							</h1>
						</div>
					</div>

					<Link
						to="/admin/blog/analytics"
						className="group flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-slate-200"
					>
						<BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
						<span>Detailed Analytics</span>
					</Link>
				</div>

				{/* Main Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					<MetricCard
						title="Total Articles"
						value={stats.total || 0}
						icon={FileText}
						color="blue"
					/>
					<MetricCard
						title="Published"
						value={stats.published || 0}
						icon={Award}
						color="emerald"
						trend="+12%"
					/>
					<MetricCard
						title="Drafts"
						value={stats.draft || 0}
						icon={FileText}
						color="amber"
					/>
					<MetricCard
						title="Total Views"
						value={stats.totalViews?.toLocaleString() || 0}
						icon={Eye}
						color="indigo"
						trend="+24%"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Distribution Charts */}
					<div className="lg:col-span-2 space-y-8">
						<div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-2xl shadow-slate-100/50">
							<div className="flex items-center justify-between mb-8">
								<h2 className="text-xl font-black text-slate-900 tracking-tight">
									Content Breakdown
								</h2>
								<span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
									By Category & Type
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
								{/* By Type */}
								<div className="space-y-6">
									<h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">
										By Format type
									</h3>
									<div className="space-y-4">
										{stats.byType?.length > 0 ? (
											stats.byType.map((item, idx) => (
												<div key={idx} className="space-y-2 group">
													<div className="flex justify-between text-xs font-bold text-slate-700">
														<span className="capitalize">
															{item._id || "Other"}
														</span>
														<span>
															{item.count}{" "}
															<span className="text-slate-300 ml-1">
																({Math.round((item.count / stats.total) * 100)}
																%)
															</span>
														</span>
													</div>
													<div className="h-2 bg-slate-50 rounded-full overflow-hidden">
														<div
															className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:brightness-110"
															style={{
																width: `${(item.count / stats.total) * 100}%`,
															}}
														></div>
													</div>
												</div>
											))
										) : (
											<p className="text-slate-400 text-xs italic">
												No type data found
											</p>
										)}
									</div>
								</div>

								{/* By Category */}
								<div className="space-y-6">
									<h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">
										By Industry category
									</h3>
									<div className="space-y-4">
										{stats.byCategory?.length > 0 ? (
											stats.byCategory.map((item, idx) => (
												<div key={idx} className="space-y-2 group">
													<div className="flex justify-between text-xs font-bold text-slate-700">
														<span className="capitalize">
															{item._id || "Other"}
														</span>
														<span>
															{item.count}{" "}
															<span className="text-slate-300 ml-1">
																({Math.round((item.count / stats.total) * 100)}
																%)
															</span>
														</span>
													</div>
													<div className="h-2 bg-slate-50 rounded-full overflow-hidden">
														<div
															className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:brightness-110"
															style={{
																width: `${(item.count / stats.total) * 100}%`,
															}}
														></div>
													</div>
												</div>
											))
										) : (
											<p className="text-slate-400 text-xs italic">
												No category data found
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Tracking Detailed */}
						<div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-2xl shadow-slate-100/50">
							<div className="flex items-center justify-between mb-8">
								<h2 className="text-xl font-black text-slate-900 tracking-tight">
									Audience Insights
								</h2>
								<Globe className="w-5 h-5 text-emerald-500" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
								{/* Devices */}
								<div className="space-y-6">
									<h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
										<Smartphone className="w-3 h-3" />
										Device breakdown
									</h3>
									<div className="space-y-4">
										{stats.tracking?.deviceBreakdown?.map((device, idx) => (
											<div
												key={idx}
												className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all font-bold text-sm"
											>
												<span className="capitalize text-slate-600">
													{device._id || "Unknown"}
												</span>
												<span className="text-slate-900">{device.count}</span>
											</div>
										))}
									</div>
								</div>

								{/* Top Countries */}
								<div className="space-y-6">
									<h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
										<Globe className="w-3 h-3" />
										Top Geographies
									</h3>
									<div className="space-y-4">
										{stats.tracking?.topCountries
											?.slice(0, 5)
											.map((country, idx) => (
												<div
													key={idx}
													className="group flex items-center gap-4"
												>
													<span className="text-[10px] font-black text-slate-300 w-4">
														0{idx + 1}
													</span>
													<div className="flex-1 space-y-1">
														<div className="flex justify-between text-xs font-bold text-slate-700">
															<span>{country._id || "International"}</span>
															<span className="text-emerald-500">
																{country.count}
															</span>
														</div>
														<div className="h-[2px] bg-slate-100 rounded-full overflow-hidden">
															<div
																className="h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-all duration-700"
																style={{
																	width: `${
																		(country.count /
																			stats.tracking.totalVisits) *
																		100
																	}%`,
																}}
															></div>
														</div>
													</div>
												</div>
											))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar stats */}
					<div className="space-y-8">
						{/* Engagement card */}
						<div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
							<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]"></div>
							<div className="relative z-10">
								<div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10">
									<Heart className="w-6 h-6 text-rose-500" />
								</div>
								<h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">
									Social Impact
								</h3>
								<div className="space-y-6">
									<div>
										<p className="text-4xl font-black tracking-tighter">
											{stats.totalLikes || 0}
										</p>
										<p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
											Cumulative Likes
										</p>
									</div>
									<div className="h-px bg-white/10"></div>
									<div>
										<p className="text-4xl font-black tracking-tighter">
											{Math.round(
												((stats.totalLikes || 0) / (stats.totalViews || 1)) *
													100
											)}
											%
										</p>
										<p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
											Engagement Rate
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Visitors overview */}
						<div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-2xl shadow-slate-100/50">
							<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
								<Users className="w-6 h-6 text-indigo-500" />
							</div>
							<h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
								Visitor Flow
							</h3>
							<div className="space-y-8">
								<div className="flex items-end gap-x-4">
									<div className="flex-1">
										<p className="text-2xl font-black text-slate-900 leading-none">
											{stats.tracking?.totalVisits || 0}
										</p>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2">
											Total Sessions
										</p>
									</div>
									<div className="w-24 h-12 border-b-2 border-emerald-500/20 relative">
										<div className="absolute inset-0 flex items-end gap-1">
											{[3, 5, 4, 8, 6, 9, 7].map((h, i) => (
												<div
													key={i}
													className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/40 transition-colors rounded-t-sm"
													style={{ height: `${h * 10}%` }}
												></div>
											))}
										</div>
									</div>
								</div>

								<div className="flex items-end gap-x-4">
									<div className="flex-1">
										<p className="text-2xl font-black text-slate-900 leading-none">
											{stats.tracking?.uniqueVisitors || 0}
										</p>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2">
											Unique Visitors
										</p>
									</div>
									<div className="w-24 h-12 border-b-2 border-indigo-500/20 relative">
										<div className="absolute inset-0 flex items-end gap-1">
											{[4, 6, 3, 5, 8, 4, 6].map((h, i) => (
												<div
													key={i}
													className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/40 transition-colors rounded-t-sm"
													style={{ height: `${h * 10}%` }}
												></div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Quick action card */}
						<div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 flex flex-col items-center text-center">
							<div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
								<TrendingUp className="w-8 h-8 text-emerald-500" />
							</div>
							<h4 className="text-lg font-black text-emerald-950 mb-2">
								Growth Mode
							</h4>
							<p className="text-emerald-700/60 text-xs font-bold leading-relaxed mb-6">
								Your blog is reaching more people this month. Keep creating
								high-quality content!
							</p>
							<Link
								to="/admin/blog/create"
								className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
							>
								Write new Story
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminBlogStats;
