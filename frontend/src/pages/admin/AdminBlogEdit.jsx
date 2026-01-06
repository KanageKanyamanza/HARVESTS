import React from "react";
import { useParams } from "react-router-dom";
import { useBlogForm } from "../../hooks/useBlogForm";
import AutoTranslation from "../../components/admin/AutoTranslation";
import ImageUploader from "../../components/admin/ImageUploader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import {
	BlogFormHeader,
	LanguageConfig,
	BasicInfoFields,
	ContentEditors,
	CaseStudyFields,
	TutorialFields,
	TestimonialFields,
	TagsField,
	FeaturedImageField,
	SEOFields,
	FormActions,
} from "../../components/admin/BlogForm";

const AdminBlogEdit = () => {
	const { id } = useParams();
	const form = useBlogForm(id);
	const {
		formData,
		setFormData,
		loading,
		fetchingBlog,
		isEdit,
		newTag,
		setNewTag,
		selectedLanguage,
		setSelectedLanguage,
		useAutoTranslation,
		setUseAutoTranslation,
		uploadingImage,
		fileInputRef,
		loadFromStorage,
		handleChange,
		handleBilingualChange,
		handleTitleChange,
		addTag,
		removeTag,
		handleUploadFeaturedImage,
		handleSubmit,
		resetForm,
		navigate,
	} = form;

	if (fetchingBlog) {
		return (
			<div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
				<LoadingSpinner size="lg" />
				<p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
					Retrieving publication data...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
			{/* Background Deco */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-6xl mx-auto px-5 py-12 relative z-10">
				<BlogFormHeader
					isEdit={isEdit}
					navigate={navigate}
					loadFromStorage={loadFromStorage}
					resetForm={resetForm}
				/>

				<form
					onSubmit={handleSubmit}
					className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden"
				>
					<div className="p-8 md:p-12 space-y-12">
						{/* Configuration Section */}
						<section className="space-y-8">
							<div className="flex items-center gap-4 border-b border-slate-50 pb-4">
								<div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
									<Edit3 className="w-5 h-5 text-emerald-500" />
								</div>
								<h2 className="text-xl font-black text-slate-900 tracking-tight text-stroke-thin">
									Settings & Languages
								</h2>
							</div>
							<div className="bg-white/50 p-6 rounded-[32px] border border-slate-100">
								<LanguageConfig
									selectedLanguage={selectedLanguage}
									setSelectedLanguage={setSelectedLanguage}
									useAutoTranslation={useAutoTranslation}
									setUseAutoTranslation={setUseAutoTranslation}
								/>
							</div>
						</section>

						{/* Identity Section */}
						<section className="space-y-8">
							<div className="flex items-center gap-4 border-b border-slate-50 pb-4">
								<div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
								<h2 className="text-xl font-black text-slate-900 tracking-tight">
									Core Identity
								</h2>
							</div>
							<BasicInfoFields
								formData={formData}
								handleTitleChange={handleTitleChange}
								handleChange={handleChange}
								handleBilingualChange={handleBilingualChange}
								selectedLanguage={selectedLanguage}
							/>
						</section>

						{/* Content Section */}
						<section className="space-y-8">
							<div className="flex items-center gap-4 border-b border-slate-50 pb-4">
								<div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
								<h2 className="text-xl font-black text-slate-900 tracking-tight">
									Story Content
								</h2>
							</div>
							<ContentEditors
								formData={formData}
								handleBilingualChange={handleBilingualChange}
							/>

							{useAutoTranslation && (
								<div className="bg-emerald-50/50 p-8 rounded-[32px] border border-emerald-100 mt-8 shadow-inner">
									<AutoTranslation
										formData={formData}
										onFormDataChange={setFormData}
										selectedLanguage={selectedLanguage}
									/>
								</div>
							)}
						</section>

						{/* Dynamic Schema Fields */}
						{(formData.type === "etude-cas" ||
							formData.type === "tutoriel" ||
							formData.type === "temoignage") && (
							<section className="space-y-8 p-8 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-1 h-6 bg-fuchsia-500 rounded-full"></div>
									<h2 className="text-xl font-black text-slate-900 tracking-tight">
										Specialized Data
									</h2>
								</div>
								{formData.type === "etude-cas" && (
									<CaseStudyFields
										formData={formData}
										handleChange={handleChange}
									/>
								)}
								{formData.type === "tutoriel" && (
									<TutorialFields
										formData={formData}
										handleChange={handleChange}
									/>
								)}
								{formData.type === "temoignage" && (
									<TestimonialFields
										formData={formData}
										handleChange={handleChange}
									/>
								)}
							</section>
						)}

						{/* Metadata Section */}
						<section className="space-y-8">
							<div className="flex items-center gap-4 border-b border-slate-50 pb-4">
								<div className="w-1 h-6 bg-amber-500 rounded-full"></div>
								<h2 className="text-xl font-black text-slate-900 tracking-tight">
									Marketing & Media
								</h2>
							</div>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
								<div className="space-y-8">
									<TagsField
										formData={formData}
										newTag={newTag}
										setNewTag={setNewTag}
										addTag={addTag}
										removeTag={removeTag}
									/>
									<div className="bg-white/50 p-8 rounded-[32px] border border-slate-100">
										<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
											Publication Gallery
										</label>
										<ImageUploader
											images={formData.images}
											onImagesChange={(images) =>
												handleChange("images", images)
											}
											maxImages={10}
											showPositionControls={true}
										/>
									</div>
								</div>
								<div className="space-y-8">
									<FeaturedImageField
										formData={formData}
										setFormData={setFormData}
										uploadingImage={uploadingImage}
										handleUploadFeaturedImage={handleUploadFeaturedImage}
										fileInputRef={fileInputRef}
									/>
								</div>
							</div>
						</section>

						{/* SEO Optimization */}
						<section className="space-y-8 p-8 bg-blue-50/30 rounded-[32px] border border-blue-100">
							<div className="flex items-center gap-4 mb-6 text-blue-600">
								<div className="w-10 h-1 border-t-2 border-blue-600 rounded-full"></div>
								<h2 className="text-xl font-black tracking-tight">
									SEO Performance
								</h2>
							</div>
							<SEOFields
								formData={formData}
								handleBilingualChange={handleBilingualChange}
							/>
						</section>
					</div>

					<div className="bg-slate-50/80 backdrop-blur-md p-8 border-t border-slate-100 mt-12 flex items-center justify-between">
						<div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
							Last modified: {new Date(formData.updatedAt).toLocaleDateString()}
						</div>
						<FormActions
							loading={loading}
							isEdit={isEdit}
							navigate={navigate}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AdminBlogEdit;
