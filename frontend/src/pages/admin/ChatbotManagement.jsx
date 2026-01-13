import React, { useState, useEffect, useCallback } from "react";
import {
	MessageCircle,
	AlertCircle,
	TrendingUp,
	BarChart3,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import StatsTab from "./chatbotManagement/StatsTab";
import AdvancedStatsTab from "./chatbotManagement/AdvancedStatsTab";
import QuestionsTab from "./chatbotManagement/QuestionsTab";
import InteractionsTab from "./chatbotManagement/InteractionsTab";
import AnswerModal from "./chatbotManagement/AnswerModal";
import ChatDetailsModal from "./chatbotManagement/ChatDetailsModal";
import { formatDate, formatTime } from "./chatbotManagement/utils";

const ChatbotManagement = () => {
	const [activeTab, setActiveTab] = useState("stats");
	const [stats, setStats] = useState(null);
	const [timeRange, setTimeRange] = useState("all");
	const [questions, setQuestions] = useState([]);
	const [interactions, setInteractions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		total: 0,
	});
	const [interactionsPagination, setInteractionsPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		total: 0,
	});
	const [statusFilter, setStatusFilter] = useState("pending");
	const [interactionFilters, setInteractionFilters] = useState({
		responseType: "",
		feedback: "",
		search: "",
		userId: "",
		startDate: "",
		endDate: "",
	});
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [answerForm, setAnswerForm] = useState({
		answer: "",
		keywords: "",
		category: "autre",
	});
	const [saving, setSaving] = useState(false);
	const [selectedInteraction, setSelectedInteraction] = useState(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	const loadStats = useCallback(async () => {
		try {
			const response = await adminService.getChatStats({ timeRange });
			if (response.status === "success") {
				setStats(response.data);
			}
		} catch (error) {
			console.error("Erreur chargement stats:", error);
		}
	}, [timeRange]);

	const loadQuestions = useCallback(
		async (page = 1) => {
			try {
				setLoading(true);
				const response = await adminService.getUnansweredQuestions({
					page,
					limit: 20,
					status: statusFilter,
				});
				if (response.status === "success") {
					setQuestions(response.data.questions);
					setPagination(response.data.pagination);
				}
			} catch (error) {
				console.error("Erreur chargement questions:", error);
			} finally {
				setLoading(false);
			}
		},
		[statusFilter]
	);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	const loadInteractions = useCallback(
		async (page = 1) => {
			try {
				setLoading(true);
				const response = await adminService.getAllInteractions({
					page,
					limit: 50,
					...interactionFilters,
				});
				if (response.status === "success") {
					setInteractions(response.data.interactions);
					setInteractionsPagination(response.data.pagination);
				}
			} catch (error) {
				console.error("Erreur chargement interactions:", error);
			} finally {
				setLoading(false);
			}
		},
		[interactionFilters]
	);

	useEffect(() => {
		if (activeTab === "questions") {
			loadQuestions();
		} else if (activeTab === "interactions") {
			loadInteractions();
		}
	}, [activeTab, loadQuestions, loadInteractions]);

	const handleAnswerQuestion = async () => {
		if (!selectedQuestion || !answerForm.answer.trim()) return;

		setSaving(true);
		try {
			const keywords = answerForm.keywords
				.split(",")
				.map((k) => k.trim().toLowerCase())
				.filter((k) => k.length > 0);

			await adminService.answerQuestion(selectedQuestion._id, {
				answer: answerForm.answer,
				keywords,
				category: answerForm.category,
			});

			setSelectedQuestion(null);
			setAnswerForm({ answer: "", keywords: "", category: "autre" });
			loadQuestions(pagination.currentPage);
			loadStats();
		} catch (error) {
			console.error("Erreur réponse:", error);
			alert("Erreur lors de l'enregistrement de la réponse");
		} finally {
			setSaving(false);
		}
	};

	const handleIgnoreQuestion = async (id) => {
		if (!window.confirm("Ignorer cette question ?")) return;

		try {
			await adminService.ignoreQuestion(id);
			loadQuestions(pagination.currentPage);
			loadStats();
		} catch (error) {
			console.error("Erreur ignore:", error);
		}
	};

	const handleViewChatDetails = async (interaction) => {
		if (!interaction.userId) {
			alert("Cette interaction n'a pas d'utilisateur associé");
			return;
		}

		setSelectedInteraction(interaction);
		setLoadingHistory(true);

		try {
			const response = await adminService.getUserChatHistory(
				interaction.userId._id || interaction.userId,
				{
					limit: 100, // Récupérer les 100 dernières interactions
				}
			);

			if (response.status === "success") {
				// Trier par date croissante pour afficher la conversation dans l'ordre chronologique
				const sortedHistory = (response.data.interactions || []).sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				);
				setChatHistory(sortedHistory);
			}
		} catch (error) {
			console.error("Erreur lors du chargement de l'historique:", error);
			alert("Erreur lors du chargement de l'historique du chat");
		} finally {
			setLoadingHistory(false);
		}
	};

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-8">
				{/* Header */}
				<div className="mb-8 animate-fade-in-down">
					<div className="flex items-center gap-2 text-primary-600 font-black text-[9px] uppercase tracking-widest mb-2">
						<div className="w-5 h-[2px] bg-primary-600"></div>
						<span>AI Interface</span>
					</div>
					<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
						Gestion du <span className="text-primary-600">Chatbot</span>
					</h1>
					<p className="text-xs text-gray-500 font-medium">
						Analysez les interactions et formez l'intelligence artificielle
						Harvests
					</p>
				</div>

				{/* Header avec sélecteur de période */}
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 mb-6 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<span className="text-[9px] font-black uppercase text-gray-400">
								Période d'analyse :
							</span>
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option value="7d">7 derniers jours</option>
								<option value="30d">30 derniers jours</option>
								<option value="90d">90 derniers jours</option>
								<option value="1y">Dernière année</option>
								<option value="all">Tout l'historique</option>
							</select>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 mb-6 overflow-hidden">
					<div className="border-b border-gray-100">
						<nav className="flex -mb-px">
							<button
								onClick={() => setActiveTab("stats")}
								className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest border-b-2 transition-all duration-300 ${
									activeTab === "stats"
										? "border-green-500 text-green-600 bg-green-50/50"
										: "border-transparent text-gray-400 hover:text-gray-600"
								}`}
							>
								<TrendingUp className="h-3.5 w-3.5 inline mr-2" />
								Vue d'ensemble
							</button>
							<button
								onClick={() => setActiveTab("advanced")}
								className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest border-b-2 transition-all duration-300 ${
									activeTab === "advanced"
										? "border-green-500 text-green-600 bg-green-50/50"
										: "border-transparent text-gray-400 hover:text-gray-600"
								}`}
							>
								<BarChart3 className="h-3.5 w-3.5 inline mr-2" />
								Analytics Avancées
							</button>
							<button
								onClick={() => setActiveTab("questions")}
								className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest border-b-2 transition-all duration-300 ${
									activeTab === "questions"
										? "border-green-500 text-green-600 bg-green-50/50"
										: "border-transparent text-gray-400 hover:text-gray-600"
								}`}
							>
								<AlertCircle className="h-3.5 w-3.5 inline mr-2" />
								Questions sans réponse
								{stats?.overview?.pendingQuestions > 0 && (
									<span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-md">
										{stats.overview.pendingQuestions}
									</span>
								)}
							</button>
							<button
								onClick={() => setActiveTab("interactions")}
								className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest border-b-2 transition-all duration-300 ${
									activeTab === "interactions"
										? "border-green-500 text-green-600 bg-green-50/50"
										: "border-transparent text-gray-400 hover:text-gray-600"
								}`}
							>
								<MessageCircle className="h-3.5 w-3.5 inline mr-2" />
								Interactions
							</button>
						</nav>
					</div>
				</div>

				{/* Stats Tab */}
				{activeTab === "stats" && (
					<StatsTab
						stats={stats}
						setActiveTab={setActiveTab}
						setSelectedQuestion={setSelectedQuestion}
					/>
				)}

				{/* Advanced Stats Tab */}
				{activeTab === "advanced" && <AdvancedStatsTab stats={stats} />}

				{/* Questions Tab */}
				{activeTab === "questions" && (
					<QuestionsTab
						questions={questions}
						loading={loading}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						pagination={pagination}
						loadQuestions={loadQuestions}
						formatDate={formatDate}
						setSelectedQuestion={setSelectedQuestion}
						setAnswerForm={setAnswerForm}
						handleIgnoreQuestion={handleIgnoreQuestion}
					/>
				)}

				{/* Interactions Tab */}
				{activeTab === "interactions" && (
					<InteractionsTab
						interactions={interactions}
						loading={loading}
						interactionFilters={interactionFilters}
						setInteractionFilters={setInteractionFilters}
						interactionsPagination={interactionsPagination}
						loadInteractions={loadInteractions}
						formatDate={formatDate}
						handleViewChatDetails={handleViewChatDetails}
					/>
				)}

				{/* Answer Modal */}
				<AnswerModal
					selectedQuestion={selectedQuestion}
					answerForm={answerForm}
					setAnswerForm={setAnswerForm}
					saving={saving}
					onClose={() => setSelectedQuestion(null)}
					onSubmit={handleAnswerQuestion}
				/>

				{/* Chat Details Modal */}
				<ChatDetailsModal
					selectedInteraction={selectedInteraction}
					chatHistory={chatHistory}
					loadingHistory={loadingHistory}
					formatDate={formatDate}
					formatTime={formatTime}
					onClose={() => {
						setSelectedInteraction(null);
						setChatHistory([]);
					}}
				/>
			</div>
		</div>
	);
};

export default ChatbotManagement;
