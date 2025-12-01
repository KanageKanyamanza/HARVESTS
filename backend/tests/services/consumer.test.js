const mongoose = require('mongoose');
const consumerProfileService = require('../../services/consumer/consumerProfileService');
const consumerStatsService = require('../../services/consumer/consumerStatsService');
const consumerOrderService = require('../../services/consumer/consumerOrderService');

// Mock des modèles - IMPORTANT: doit être avant les imports des services
jest.mock('../../models/Consumer');
jest.mock('../../models/Order');
jest.mock('../../models/Review');

// Mock orderService avant l'import
jest.mock('../../services/orderService', () => ({
  getAllOrders: jest.fn(),
  getOrderById: jest.fn()
}));

const Consumer = require('../../models/Consumer');
const Order = require('../../models/Order');
const orderService = require('../../services/orderService');

describe('Consumer Services', () => {
  let mockConsumerId;
  let mockConsumer;

  beforeEach(() => {
    mockConsumerId = new mongoose.Types.ObjectId();
    mockConsumer = {
      _id: mockConsumerId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({})
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('consumerProfileService', () => {
    describe('getConsumerProfile', () => {
      it('devrait retourner le profil du consommateur', async () => {
        Consumer.findById.mockResolvedValue(mockConsumer);

        const result = await consumerProfileService.getConsumerProfile(mockConsumerId);

        expect(Consumer.findById).toHaveBeenCalledWith(mockConsumerId);
        expect(result).toEqual(mockConsumer);
      });

      it('devrait lancer une erreur si le consommateur n\'existe pas', async () => {
        Consumer.findById.mockResolvedValue(null);

        await expect(
          consumerProfileService.getConsumerProfile(mockConsumerId)
        ).rejects.toThrow('Consommateur non trouvé');
      });
    });

    describe('updateConsumerProfile', () => {
      it('devrait mettre à jour le profil avec les champs autorisés', async () => {
        const updateData = {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '0987654321',
          invalidField: 'should be ignored'
        };

        // Le service filtre les champs, donc on mocke seulement les champs autorisés
        const updatedConsumer = {
          ...mockConsumer,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '0987654321'
        };

        Consumer.findByIdAndUpdate.mockResolvedValue(updatedConsumer);

        const result = await consumerProfileService.updateConsumerProfile(
          mockConsumerId,
          updateData
        );

        expect(Consumer.findByIdAndUpdate).toHaveBeenCalledWith(
          mockConsumerId,
          { firstName: 'Jane', lastName: 'Smith', phone: '0987654321' },
          { new: true, runValidators: true }
        );
        expect(result.firstName).toBe('Jane');
        expect(result.invalidField).toBeUndefined();
      });

      it('devrait lancer une erreur si le consommateur n\'existe pas', async () => {
        Consumer.findByIdAndUpdate.mockResolvedValue(null);

        await expect(
          consumerProfileService.updateConsumerProfile(mockConsumerId, { firstName: 'Jane' })
        ).rejects.toThrow('Consommateur non trouvé');
      });
    });
  });

  describe('consumerStatsService', () => {
    describe('getConsumerStats', () => {
      it('devrait retourner les statistiques du consommateur', async () => {
        const mockOrders = [
          { status: 'completed', total: 100 },
          { status: 'completed', total: 50 },
          { status: 'pending', total: 30 }
        ];

        // Mock pour Consumer.findById().select().exec()
        const mockConsumerQuery = {
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue({
            loyaltyPoints: 100,
            loyaltyTier: 'bronze'
          })
        };
        Consumer.findById = jest.fn().mockReturnValue(mockConsumerQuery);

        Order.find = jest.fn().mockResolvedValue(mockOrders);
        Order.countDocuments = jest.fn().mockResolvedValue(3);

        const result = await consumerStatsService.getConsumerStats(mockConsumerId);

        expect(result.totalOrders).toBe(3);
        expect(result.totalSpent).toBe(150);
      });
    });
  });

  describe('consumerOrderService', () => {
    describe('getConsumerOrders', () => {
      it('devrait retourner les commandes du consommateur', async () => {
        const mockOrders = {
          orders: [
            { _id: new mongoose.Types.ObjectId(), status: 'completed' },
            { _id: new mongoose.Types.ObjectId(), status: 'pending' }
          ],
          pagination: {
            total: 2,
            current: 1,
            pages: 1
          }
        };

        // Mock orderService.getAllOrders qui est utilisé par getConsumerOrders
        orderService.getAllOrders = jest.fn().mockResolvedValue(mockOrders);

        const result = await consumerOrderService.getConsumerOrders(mockConsumerId, {
          page: 1,
          limit: 10
        });

        expect(result.orders).toHaveLength(2);
        expect(result.pagination.total).toBe(2);
      });
    });
  });
});

