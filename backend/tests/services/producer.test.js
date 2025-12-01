const mongoose = require('mongoose');
const producerProfileService = require('../../services/producer/producerProfileService');
const producerStatsService = require('../../services/producer/producerStatsService');
const producerProductService = require('../../services/producer/producerProductService');

// Mock des modèles - IMPORTANT: doit être avant les imports des services
jest.mock('../../models/Producer');
jest.mock('../../models/Product');
jest.mock('../../models/Order');

const Producer = require('../../models/Producer');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

describe('Producer Services', () => {
  let mockProducerId;
  let mockProducer;

  beforeEach(() => {
    mockProducerId = new mongoose.Types.ObjectId();
    mockProducer = {
      _id: mockProducerId,
      farmName: 'Test Farm',
      businessName: 'Test Business',
      email: 'producer@example.com',
      save: jest.fn().mockResolvedValue(true)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('producerProfileService', () => {
    describe('updateProducerProfile', () => {
      it('devrait mettre à jour le profil du producteur', async () => {
        const updateData = {
          firstName: 'John',
          lastName: 'Doe',
          farmName: 'Updated Farm'
        };

        const updatedProducer = {
          ...mockProducer,
          ...updateData
        };

        Producer.findByIdAndUpdate.mockResolvedValue(updatedProducer);

        const result = await producerProfileService.updateProducerProfile(
          mockProducerId,
          updateData
        );

        expect(Producer.findByIdAndUpdate).toHaveBeenCalled();
        expect(result.farmName).toBe('Updated Farm');
      });
    });
  });

  describe('producerStatsService', () => {
    describe('getMyStats', () => {
      it('devrait retourner les statistiques d\'affaires', async () => {
        const productId = new mongoose.Types.ObjectId();
        const mockOrders = [
          { 
            status: 'completed', 
            total: 100,
            items: [{ product: productId, quantity: 2 }]
          },
          { 
            status: 'pending', 
            total: 50,
            items: [{ product: productId, quantity: 1 }]
          }
        ];

        const mockProduct = {
          _id: productId,
          name: 'Test Product',
          category: 'vegetable'
        };

        const mockOrderQuery = {
          populate: jest.fn().mockResolvedValue(mockOrders)
        };
        Order.find = jest.fn().mockReturnValue(mockOrderQuery);
        Product.find = jest.fn().mockResolvedValue([]);
        Order.countDocuments = jest.fn().mockResolvedValue(2);
        Product.countDocuments = jest.fn().mockResolvedValue(5);

        // Mock pour Product.findById().select()
        const mockProductQuery = {
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProduct)
        };
        Product.findById = jest.fn().mockReturnValue(mockProductQuery);

        const result = await producerStatsService.getMyStats(mockProducerId);

        expect(result).toBeDefined();
        expect(result.totalOrders).toBeDefined();
      });
    });
  });

  describe('producerProductService', () => {
    describe('getProducts', () => {
      it('devrait retourner les produits du producteur', async () => {
        const mockProducts = [
          { _id: new mongoose.Types.ObjectId(), name: 'Tomato' },
          { _id: new mongoose.Types.ObjectId(), name: 'Potato' }
        ];

        const mockProductQuery = {
          sort: jest.fn().mockResolvedValue(mockProducts)
        };
        Product.find = jest.fn().mockReturnValue(mockProductQuery);

        const result = await producerProductService.getProducts(mockProducerId);

        expect(Product.find).toHaveBeenCalledWith({
          producer: mockProducerId
        });
        expect(result).toHaveLength(2);
      });
    });
  });
});

