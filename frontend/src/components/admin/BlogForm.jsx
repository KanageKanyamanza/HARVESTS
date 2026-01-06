import React from "react";
import {
	ArrowLeft,
	Save,
	X,
	Image as ImageIcon,
	Globe,
	Settings,
	Layers,
	BarChart,
	Plus,
	Info,
	Edit,
} from "lucide-react";
import {
	blogTypes,
	blogCategories,
	difficultyLevels,
} from "../../hooks/useBlogForm";
import SimpleTextEditor from "./SimpleTextEditor";
import AutoTranslation from "./AutoTranslation";
import ImageUploader from "./ImageUploader";
import CloudinaryImage from "../common/CloudinaryImage";
import LoadingSpinner from "../common/LoadingSpinner";

export const BlogFormHeader = ({
	isEdit,
	navigate,
	loadFromStorage,
	resetForm,
}) => (
	<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
		<div className="flex items-center gap-6">
			<button
				onClick={() => navigate("/admin/blog")}
				className="group w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md"
			>
				<ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
			</button>
			<div>
				<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
					<div className="w-8 h-[2px] bg-emerald-600"></div>
					<span>Content Studio</span>
				</div>
				<h1 className="text-4xl font-black text-slate-900 tracking-tighter">
					{isEdit ? "Edit" : "Create"}{" "}
					<span className="text-emerald-500 text-stroke-thin">Publication</span>
				</h1>
				{!isEdit && loadFromStorage() && (
					<p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
						💾 Local Draft Recovered
					</p>
				)}
			</div>
		</div>
		{!isEdit && (
			<button
				type="button"
				onClick={() => window.confirm("Effacer le brouillon ?") && resetForm()}
				className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all"
			>
				Purge Draft
			</button>
		)}
	</div>
);

export const LanguageConfig = ({
	selectedLanguage,
	setSelectedLanguage,
	useAutoTranslation,
	setUseAutoTranslation,
}) => (
	<div className="bg-emerald-50/50 backdrop-blur-sm p-8 rounded-[32px] border border-emerald-100 relative overflow-hidden group">
		<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
		<div className="relative z-10">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
						<Globe className="w-5 h-5" />
					</div>
					<h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
						Global Strategy
					</h3>
				</div>
				<label className="flex items-center gap-3 cursor-pointer group/toggle">
					<span className="text-xs font-bold text-slate-500">
						Auto-Translation
					</span>
					<div className="relative">
						<input
							type="checkbox"
							className="sr-only"
							checked={useAutoTranslation}
							onChange={(e) => setUseAutoTranslation(e.target.checked)}
						/>
						<div
							className={`w-12 h-6 rounded-full transition-colors duration-300 ${
								useAutoTranslation ? "bg-emerald-500" : "bg-slate-200"
							}`}
						></div>
						<div
							className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
								useAutoTranslation ? "translate-x-6" : ""
							}`}
						></div>
					</div>
				</label>
			</div>

			{useAutoTranslation ? (
				<div className="space-y-6">
					<div className="py-2 px-4 bg-white/50 border border-emerald-100 rounded-xl inline-block">
						<p className="text-xs font-bold text-emerald-700">
							✨ Artificial Intelligence will synchronize your content.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
							Primary Editor
						</span>
						<div className="flex gap-3">
							{[
								{ id: "fr", label: "Français", icon: "🇫🇷" },
								{ id: "en", label: "English", icon: "🇬🇧" },
							].map((lang) => (
								<button
									key={lang.id}
									type="button"
									onClick={() => setSelectedLanguage(lang.id)}
									className={`px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 shadow-sm flex items-center gap-3 border ${
										selectedLanguage === lang.id
											? "bg-slate-900 text-white border-slate-900"
											: "bg-white text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-600"
									}`}
								>
									<span className="text-lg">{lang.icon}</span>
									{lang.label}
								</button>
							))}
						</div>
					</div>
				</div>
			) : (
				<p className="text-xs font-bold text-slate-500 italic">
					Manual control: You will need to maintain both languages localized
					data.
				</p>
			)}
		</div>
	</div>
);

export const BasicInfoFields = ({
	formData,
	handleTitleChange,
	handleChange,
	handleBilingualChange,
	selectedLanguage,
}) => (
	<div className="space-y-8">
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					French Title (fr)
				</label>
				<input
					type="text"
					value={formData.title.fr || ""}
					onChange={(e) => handleTitleChange("fr", e.target.value)}
					className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
					placeholder="L'avenir de l'agriculture..."
				/>
			</div>
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					English Title (en)
				</label>
				<input
					type="text"
					value={formData.title.en || ""}
					onChange={(e) => handleTitleChange("en", e.target.value)}
					className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
					placeholder="The future of farming..."
				/>
			</div>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					Publication Format
				</label>
				<div className="relative">
					<select
						value={formData.type}
						onChange={(e) => handleChange("type", e.target.value)}
						className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
					>
						{blogTypes.map((t) => (
							<option key={t.value} value={t.value}>
								{t.label}
							</option>
						))}
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
						<Settings className="w-4 h-4" />
					</div>
				</div>
			</div>
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					Industry Category
				</label>
				<div className="relative">
					<select
						value={formData.category}
						onChange={(e) => handleChange("category", e.target.value)}
						className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
					>
						{blogCategories.map((c) => (
							<option key={c.value} value={c.value}>
								{c.label}
							</option>
						))}
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
						<Layers className="w-4 h-4" />
					</div>
				</div>
			</div>
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					Release Status
				</label>
				<div className="relative">
					<select
						value={formData.status}
						onChange={(e) => handleChange("status", e.target.value)}
						className={`w-full px-6 py-4 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer ${
							formData.status === "published"
								? "bg-emerald-900 border-emerald-900 text-white"
								: formData.status === "archived"
								? "bg-slate-200 border-slate-200 text-slate-600"
								: "bg-amber-400 border-amber-400 text-white"
						}`}
					>
						<option value="draft">Brouillon / Draft</option>
						<option value="published">Publié / Published</option>
						<option value="archived">Archivé / Archived</option>
					</select>
				</div>
			</div>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
					<span>French Summary</span>
					<span className="text-slate-300 font-bold">
						{formData.excerpt.fr?.length || 0} chars
					</span>
				</label>
				<textarea
					value={formData.excerpt.fr || ""}
					onChange={(e) =>
						handleBilingualChange("excerpt", "fr", e.target.value)
					}
					className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner h-32 resize-none"
					placeholder="Brève introduction en français..."
				/>
			</div>
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
					<span>English Summary</span>
					<span className="text-slate-300 font-bold">
						{formData.excerpt.en?.length || 0} chars
					</span>
				</label>
				<textarea
					value={formData.excerpt.en || ""}
					onChange={(e) =>
						handleBilingualChange("excerpt", "en", e.target.value)
					}
					className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner h-32 resize-none"
					placeholder="Short introduction in English..."
				/>
			</div>
		</div>
	</div>
);

export const ContentEditors = ({ formData, handleBilingualChange }) => {
	const [isFrCollapsed, setIsFrCollapsed] = React.useState(false);
	const [isEnCollapsed, setIsEnCollapsed] = React.useState(false);

	return (
		<div className="space-y-12">
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
							<Edit className="w-5 h-5" />
						</div>
						<h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
							Editor{" "}
							<span className="text-emerald-500 text-xs ml-2">Français</span>
						</h3>
					</div>
					<button
						type="button"
						onClick={() => setIsFrCollapsed(!isFrCollapsed)}
						className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
					>
						{isFrCollapsed ? "Expand" : "Collapse"}
					</button>
				</div>
				{!isFrCollapsed && (
					<div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
						<SimpleTextEditor
							value={formData.content.fr || ""}
							onChange={(v) => handleBilingualChange("content", "fr", v)}
							placeholder="Rédigez en français..."
							editorId="blog-content-editor-fr"
						/>
					</div>
				)}
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
							<Edit className="w-5 h-5" />
						</div>
						<h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
							Editor <span className="text-blue-500 text-xs ml-2">English</span>
						</h3>
					</div>
					<button
						type="button"
						onClick={() => setIsEnCollapsed(!isEnCollapsed)}
						className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
					>
						{isEnCollapsed ? "Expand" : "Collapse"}
					</button>
				</div>
				{!isEnCollapsed && (
					<div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
						<SimpleTextEditor
							value={formData.content.en || ""}
							onChange={(v) => handleBilingualChange("content", "en", v)}
							placeholder="Write in English..."
							editorId="blog-content-editor-en"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export const CaseStudyFields = ({ formData, handleChange }) => (
	<div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-slate-100">
		<div className="flex items-center gap-4 mb-8">
			<div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
				<BarChart className="w-6 h-6" />
			</div>
			<h3 className="text-lg font-black text-slate-900 tracking-tight">
				Business Intelligence{" "}
				<span className="text-indigo-500">Case Study</span>
			</h3>
		</div>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
			<Input
				label="Target Company"
				value={formData.caseStudy.company}
				onChange={(v) => handleChange("caseStudy.company", v)}
				placeholder="Acme Corp"
			/>
			<Input
				label="Market Sector"
				value={formData.caseStudy.sector}
				onChange={(v) => handleChange("caseStudy.sector", v)}
				placeholder="Finance, Health..."
			/>
		</div>
		<div className="grid grid-cols-1 gap-8">
			<Textarea
				label="Core Challenge"
				value={formData.caseStudy.challenge}
				onChange={(v) => handleChange("caseStudy.challenge", v)}
				placeholder="What was the problem?"
			/>
			<Textarea
				label="Implemented Solution"
				value={formData.caseStudy.solution}
				onChange={(v) => handleChange("caseStudy.solution", v)}
				placeholder="Our response..."
			/>
			<Textarea
				label="Measurable Results"
				value={formData.caseStudy.results}
				onChange={(v) => handleChange("caseStudy.results", v)}
				placeholder="The impact..."
			/>
		</div>
	</div>
);

export const TutorialFields = ({ formData, handleChange }) => (
	<div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-slate-100">
		<div className="flex items-center gap-4 mb-8">
			<div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
				<Layers className="w-6 h-6" />
			</div>
			<h3 className="text-lg font-black text-slate-900 tracking-tight">
				Educational <span className="text-amber-500">Tutorial Data</span>
			</h3>
		</div>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div className="space-y-2">
				<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
					Difficulty Tier
				</label>
				<select
					value={formData.tutorial.difficulty}
					onChange={(e) => handleChange("tutorial.difficulty", e.target.value)}
					className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
				>
					{difficultyLevels.map((l) => (
						<option key={l.value} value={l.value}>
							{l.label}
						</option>
					))}
				</select>
			</div>
			<Input
				label="Learning Duration"
				value={formData.tutorial.duration}
				onChange={(v) => handleChange("tutorial.duration", v)}
				placeholder="15 min, 2 hours..."
			/>
		</div>
	</div>
);

export const TestimonialFields = ({ formData, handleChange }) => (
	<div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-slate-100">
		<div className="flex items-center gap-4 mb-8">
			<div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
				<Plus className="w-6 h-6" />
			</div>
			<h3 className="text-lg font-black text-slate-900 tracking-tight">
				Social Proof <span className="text-rose-500">Validation</span>
			</h3>
		</div>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
			<Input
				label="Client Full Name"
				value={formData.testimonial.clientName}
				onChange={(v) => handleChange("testimonial.clientName", v)}
			/>
			<Input
				label="Organization"
				value={formData.testimonial.clientCompany}
				onChange={(v) => handleChange("testimonial.clientCompany", v)}
			/>
			<Input
				label="Position"
				value={formData.testimonial.clientPosition}
				onChange={(v) => handleChange("testimonial.clientPosition", v)}
			/>
		</div>
		<div className="space-y-2">
			<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
				<span>Quality Rating</span>
				<span className="text-rose-500 font-bold">
					{formData.testimonial.rating} / 5 stars
				</span>
			</label>
			<div className="flex gap-4">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => handleChange("testimonial.rating", star)}
						className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all duration-300 ${
							formData.testimonial.rating >= star
								? "bg-rose-500 text-white shadow-lg shadow-rose-200"
								: "bg-slate-50 text-slate-300 border border-slate-100"
						}`}
					>
						★
					</button>
				))}
			</div>
		</div>
	</div>
);

export const TagsField = ({
	formData,
	newTag,
	setNewTag,
	addTag,
	removeTag,
}) => (
	<div className="space-y-4">
		<div className="flex items-center gap-3 mb-2">
			<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
				<Settings className="w-4 h-4" />
			</div>
			<label className="text-xs font-black text-slate-900 uppercase tracking-widest">
				Taxonomy & Tags
			</label>
		</div>
		<div className="flex flex-wrap gap-2 min-h-[48px] p-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
			{formData.tags.length === 0 && (
				<span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-3 my-auto">
					No tags attached yet...
				</span>
			)}
			{formData.tags.map((tag, i) => (
				<span
					key={i}
					className="group inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-600 shadow-sm hover:border-emerald-200 hover:text-emerald-600 transition-all pointer-events-none"
				>
					{tag}
					<button
						type="button"
						onClick={() => removeTag(tag)}
						className="ml-3 p-1 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all pointer-events-auto"
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			))}
		</div>
		<div className="flex gap-3">
			<input
				type="text"
				value={newTag}
				onChange={(e) => setNewTag(e.target.value)}
				onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
				className="flex-1 px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm placeholder:text-slate-300"
				placeholder="Add new keyword..."
			/>
			<button
				type="button"
				onClick={addTag}
				className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
			>
				Append
			</button>
		</div>
	</div>
);

export const FeaturedImageField = ({
	formData,
	setFormData,
	uploadingImage,
	handleUploadFeaturedImage,
	fileInputRef,
}) => (
	<div className="space-y-4">
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
				<ImageIcon className="w-4 h-4" />
			</div>
			<label className="text-xs font-black text-slate-900 uppercase tracking-widest">
				Cover Artwork
			</label>
		</div>
		{formData.featuredImage?.url ? (
			<div className="relative group">
				<div className="w-full h-[400px] rounded-[32px] overflow-hidden shadow-2xl">
					<CloudinaryImage
						src={formData.featuredImage.url}
						alt="Featured"
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
					/>
				</div>
				<button
					type="button"
					onClick={() =>
						setFormData((prev) => ({
							...prev,
							featuredImage: { url: "", alt: "", caption: "" },
						}))
					}
					className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md text-rose-500 rounded-3xl shadow-2xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-90"
				>
					<X className="w-6 h-6" />
				</button>
			</div>
		) : (
			<div
				onClick={() => !uploadingImage && fileInputRef.current?.click()}
				className={`relative h-[300px] border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-500 group overflow-hidden ${
					uploadingImage
						? "border-emerald-400 bg-emerald-50/50 cursor-wait"
						: "border-slate-100 hover:border-emerald-400 bg-slate-50/50 hover:bg-white cursor-pointer"
				}`}
			>
				{uploadingImage ? (
					<div className="flex flex-col items-center justify-center h-full space-y-4">
						<LoadingSpinner size="lg" text="Processing..." />
						<p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">
							Encrypting bytes to Cloudinary
						</p>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full">
						<div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-500 shadow-sm transition-all mb-6 group-hover:scale-110 group-hover:rotate-3">
							<ImageIcon className="h-10 w-10" />
						</div>
						<p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">
							Upload Hero Media
						</p>
						<p className="text-xs text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
							High resolution PNG, JPG or WebP recommended for premium display.
						</p>
					</div>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleUploadFeaturedImage}
					disabled={uploadingImage}
					className="hidden"
				/>
			</div>
		)}
	</div>
);

export const SEOFields = ({ formData, handleBilingualChange }) => (
	<div className="bg-white/70 backdrop-blur-xl border border-white rounded-[32px] p-8 mt-12 shadow-2xl shadow-slate-200/50">
		<div className="flex items-center gap-4 mb-10">
			<div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
				<Info className="w-6 h-6" />
			</div>
			<div className="flex flex-col">
				<h3 className="text-lg font-black text-slate-900 tracking-tight">
					Search Engine{" "}
					<span className="text-emerald-500 text-stroke-thin">
						Optimization
					</span>
				</h3>
				<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
					Visibility Strategy
				</span>
			</div>
		</div>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
			{/* Meta Titles */}
			<div className="space-y-6">
				<div className="space-y-2">
					<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
						<span>Meta Title (FR)</span>
						<span
							className={`font-bold ${
								(formData.metaTitle?.fr || "").length > 50
									? "text-amber-500"
									: "text-emerald-500"
							}`}
						>
							{(formData.metaTitle?.fr || "").length} / 60
						</span>
					</label>
					<input
						type="text"
						value={formData.metaTitle?.fr || ""}
						onChange={(e) =>
							e.target.value.length <= 60 &&
							handleBilingualChange("metaTitle", "fr", e.target.value)
						}
						className={`w-full px-6 py-4 bg-white border rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
							(formData.metaTitle?.fr || "").length > 50
								? "border-amber-200"
								: "border-slate-100 shadow-sm"
						}`}
						placeholder="Titre court pour Google français..."
					/>
				</div>
				<div className="space-y-2">
					<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
						<span>Meta Title (EN)</span>
						<span
							className={`font-bold ${
								(formData.metaTitle?.en || "").length > 50
									? "text-amber-500"
									: "text-emerald-500"
							}`}
						>
							{(formData.metaTitle?.en || "").length} / 60
						</span>
					</label>
					<input
						type="text"
						value={formData.metaTitle?.en || ""}
						onChange={(e) =>
							e.target.value.length <= 60 &&
							handleBilingualChange("metaTitle", "en", e.target.value)
						}
						className={`w-full px-6 py-4 bg-white border rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
							(formData.metaTitle?.en || "").length > 50
								? "border-amber-200"
								: "border-slate-100 shadow-sm"
						}`}
						placeholder="Short title for Google English..."
					/>
				</div>
			</div>

			{/* Meta Descriptions */}
			<div className="space-y-6">
				<div className="space-y-2">
					<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
						<span>Meta Description (FR)</span>
						<span
							className={`font-bold ${
								(formData.metaDescription?.fr || "").length > 140
									? "text-amber-500"
									: "text-emerald-500"
							}`}
						>
							{(formData.metaDescription?.fr || "").length} / 160
						</span>
					</label>
					<textarea
						value={formData.metaDescription?.fr || ""}
						onChange={(e) =>
							e.target.value.length <= 160 &&
							handleBilingualChange("metaDescription", "fr", e.target.value)
						}
						className={`w-full px-6 py-4 bg-white border rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24 resize-none ${
							(formData.metaDescription?.fr || "").length > 140
								? "border-amber-200"
								: "border-slate-100 shadow-sm"
						}`}
						placeholder="Résumé attrayant pour les clics français..."
					/>
				</div>
				<div className="space-y-2">
					<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
						<span>Meta Description (EN)</span>
						<span
							className={`font-bold ${
								(formData.metaDescription?.en || "").length > 140
									? "text-amber-500"
									: "text-emerald-500"
							}`}
						>
							{(formData.metaDescription?.en || "").length} / 160
						</span>
					</label>
					<textarea
						value={formData.metaDescription?.en || ""}
						onChange={(e) =>
							e.target.value.length <= 160 &&
							handleBilingualChange("metaDescription", "en", e.target.value)
						}
						className={`w-full px-6 py-4 bg-white border rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24 resize-none ${
							(formData.metaDescription?.en || "").length > 140
								? "border-amber-200"
								: "border-slate-100 shadow-sm"
						}`}
						placeholder="Compelling summary for Google English..."
					/>
				</div>
			</div>
		</div>
	</div>
);

export const FormActions = ({ loading, isEdit, navigate }) => (
	<div className="sticky bottom-8 left-0 right-0 z-50 flex justify-center mt-16 px-4">
		<div className="bg-white/80 backdrop-blur-2xl border border-white border-opacity-40 p-3 rounded-[32px] shadow-2xl flex items-center gap-3">
			<button
				type="button"
				onClick={() => navigate("/admin/blog")}
				className="px-8 py-5 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all rounded-3xl"
			>
				Abort
			</button>
			<button
				type="submit"
				disabled={loading}
				className="group flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all duration-500 shadow-2xl shadow-slate-200"
			>
				{loading ? (
					<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
				) : (
					<Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
				)}
				<span>{isEdit ? "Update Archive" : "Push Live"}</span>
			</button>
		</div>
	</div>
);

const Input = ({ label, value, onChange, placeholder, className = "" }) => (
	<div className={`space-y-2 ${className}`}>
		<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
			{label}
		</label>
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
			placeholder={placeholder}
		/>
	</div>
);

const Textarea = ({ label, value, onChange, placeholder }) => (
	<div className="space-y-2 mt-4">
		<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
			{label}
		</label>
		<textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner h-24 resize-none"
			placeholder={placeholder}
		/>
	</div>
);
