import React from 'react';
import { useBlogForm } from '../../hooks/useBlogForm';
import AutoTranslation from '../../components/admin/AutoTranslation';
import ImageUploader from '../../components/admin/ImageUploader';
import {
  BlogFormHeader, LanguageConfig, BasicInfoFields, ContentEditors,
  CaseStudyFields, TutorialFields, TestimonialFields, TagsField,
  FeaturedImageField, SEOFields, FormActions
} from '../../components/admin/BlogForm';

const AdminBlogCreate = () => {
  const form = useBlogForm();
  const {
    formData, setFormData, loading, isEdit,
    newTag, setNewTag, selectedLanguage, setSelectedLanguage,
    useAutoTranslation, setUseAutoTranslation, uploadingImage, fileInputRef, loadFromStorage,
    handleChange, handleBilingualChange, handleTitleChange,
    addTag, removeTag, handleUploadFeaturedImage, handleSubmit, resetForm, navigate
  } = form;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 pb-8 pt-5">
        <BlogFormHeader isEdit={isEdit} navigate={navigate} loadFromStorage={loadFromStorage} resetForm={resetForm} />

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <LanguageConfig selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} useAutoTranslation={useAutoTranslation} setUseAutoTranslation={setUseAutoTranslation} />
            <BasicInfoFields formData={formData} handleTitleChange={handleTitleChange} handleChange={handleChange} handleBilingualChange={handleBilingualChange} selectedLanguage={selectedLanguage} />
            <ContentEditors formData={formData} handleBilingualChange={handleBilingualChange} />

            {useAutoTranslation && <AutoTranslation formData={formData} onFormDataChange={setFormData} selectedLanguage={selectedLanguage} />}

            {formData.type === 'etude-cas' && <CaseStudyFields formData={formData} handleChange={handleChange} />}
            {formData.type === 'tutoriel' && <TutorialFields formData={formData} handleChange={handleChange} />}
            {formData.type === 'temoignage' && <TestimonialFields formData={formData} handleChange={handleChange} />}

            <TagsField formData={formData} newTag={newTag} setNewTag={setNewTag} addTag={addTag} removeTag={removeTag} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images du blog</label>
              <ImageUploader images={formData.images} onImagesChange={(images) => handleChange('images', images)} maxImages={10} showPositionControls={true} />
            </div>

            <FeaturedImageField formData={formData} setFormData={setFormData} uploadingImage={uploadingImage} handleUploadFeaturedImage={handleUploadFeaturedImage} fileInputRef={fileInputRef} />
            <SEOFields formData={formData} handleChange={handleChange} />
          </div>

          <FormActions loading={loading} isEdit={isEdit} navigate={navigate} />
        </form>
      </div>
    </div>
  );
};

export default AdminBlogCreate;
