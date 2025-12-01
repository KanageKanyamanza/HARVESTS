const mongoose = require('mongoose');
const transformerProfileService = require('../../services/transformer/transformerProfileService');
const transformerStatsService = require('../../services/transformer/transformerStatsService');
const transformerProductService = require('../../services/transformer/transformerProductService');

// Mock des modèles - IMPORTANT: doit être avant les imports des services
jest.mock('../../models/Transformer');
jest.mock('../../models/Product');
jest.mock('../../models/Order');
jest.mock('../../models/Review');

const Transformer = require('../../models/Transformer');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

describe('Transformer Services', () => {
  let mockTransformerId;
  let mockTransformer;

  beforeEach(() => {
    mockTransformerId = new mongoose.Types.ObjectId();
    mockTransformer = {
      _id: mockTransformerId,
      companyName: 'Test Transformer',
      transformationType: 'processing',
      email: 'transformer@example.com',
      save: jest.fn().mockResolvedValue(true)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transformerProfileService', () => {
    describe('updateTransformerProfile', () => {
      it('devrait mettre à jour le profil du transformateur', async () => {
        const updateData = {
          firstName: 'Jane',
          lastName: 'Smith',
          companyName: 'New Company'
        };

        const updatedTransformer = {
          ...mockTransformer,
          ...updateData
        };

        Transformer.findByIdAndUpdate.mockResolvedValue(updatedTransformer);

        const result = await transformerProfileService.updateTransformerProfile(
          mockTransformerId,
          updateData
        );

        expect(Transformer.findByIdAndUpdate).toHaveBeenCalled();
        expect(result.companyName).toBe('New Company');
      });
    });

    describe('updateCompanyInfo', () => {
      it('devrait mettre à jour uniquement les informations de l\'entreprise', async () => {
        const updateData = {
          companyName: 'Updated Company',
          transformationType: 'packaging',
          invalidField: 'should be ignored'
        };

        const updatedTransformer = {
          ...mockTransformer,
          companyName: 'Updated Company',
          transformationType: 'packaging'
        };

        Transformer.findByIdAndUpdate.mockResolvedValue(updatedTransformer);

        const result = await transformerProfileService.updateCompanyInfo(
          mockTransformerId,
          updateData
        );

        expect(result.companyName).toBe('Updated Company');
        expect(result.transformationType).toBe('packaging');
      });
    });
  });

  describe('transformerStatsService', () => {
    describe('getBusinessStats', () => {
      it('devrait retourner les statistiques d\'affaires', async () => {
        Transformer.findById.mockResolvedValue(mockTransformer);
        Order.countDocuments.mockResolvedValue(10);
        Product.countDocuments.mockResolvedValue(5);
        Order.aggregate.mockResolvedValue([{ total: 1000 }]);

        const result = await transformerStatsService.getBusinessStats(mockTransformerId);

        expect(result.totalOrders).toBe(10);
        expect(result.totalProducts).toBe(5);
      });
    });

    describe('getProductionAnalytics', () => {
      it('devrait retourner les analytics de production', async () => {
        const mockOrders = [
          {
            _id: new mongoose.Types.ObjectId(),
            status: 'completed',
            createdAt: new Date(),
            total: 500,
            items: [{ quantity: 2 }]
          }
        ];

        Order.find = jest.fn().mockResolvedValue(mockOrders);

        const result = await transformerStatsService.getProductionAnalytics(
          mockTransformerId,
          '30d'
        );

        expect(result.period).toBe('30d');
        expect(result.dailyProduction).toBeDefined();
      });
    });
  });

  describe('transformerProductService', () => {
    describe('getMyProducts', () => {
      it('devrait retourner les produits du transformateur', async () => {
        const mockProducts = [
          { _id: new mongoose.Types.ObjectId(), name: 'Product 1' },
          { _id: new mongoose.Types.ObjectId(), name: 'Product 2' }
        ];

        const mockProductQuery = {
          sort: jest.fn().mockResolvedValue(mockProducts)
        };
        Product.find = jest.fn().mockReturnValue(mockProductQuery);

        const result = await transformerProductService.getMyProducts(mockTransformerId);

        expect(Product.find).toHaveBeenCalledWith({
          transformer: mockTransformerId,
          userType: 'transformer'
        });
        expect(result).toHaveLength(2);
      });
    });
  });
});

