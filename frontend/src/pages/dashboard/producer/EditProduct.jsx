import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ProductBasicInfo from '../../../components/products/ProductBasicInfo';
import ProductPricingStock from '../../../components/products/ProductPricingStock';
import ProductImageGallery from '../../../components/products/ProductImageGallery';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useEditProduct } from '../../../hooks/useEditProduct';

const EditProduct = () => {
  const navigate = useNavigate();
  const {
    product,
    loading,
    saving,
    errors,
    formData,
    productImages,
    uploadingImages,
    setUploadingImages,
    handleInputChange,
    handleImageAdd,
    handleImageRemove,
    handleImageReorder,
    handleSubmit
  } = useEditProduct();

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (!product) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
              <p className="text-gray-600 mt-1">Modifiez les informations de votre produit</p>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <ProductBasicInfo
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />

          {/* Prix et stock */}
          <ProductPricingStock
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />

          {/* Images */}
          <ProductImageGallery
            productImages={productImages}
            uploadingImages={uploadingImages}
            setUploadingImages={setUploadingImages}
            onImageAdd={handleImageAdd}
            onImageRemove={handleImageRemove}
            onImageReorder={handleImageReorder}
          />

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/producer/products')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-harvests-light focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-harvests-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default EditProduct;
