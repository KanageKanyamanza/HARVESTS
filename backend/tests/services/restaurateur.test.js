const mongoose = require('mongoose');
const restaurateurProfileService = require('../../services/restaurateur/restaurateurProfileService');
const restaurateurStatsService = require('../../services/restaurateur/restaurateurStatsService');
const restaurateurDishService = require('../../services/restaurateur/restaurateurDishService');
const restaurateurSearchService = require('../../services/restaurateur/restaurateurSearchService');

// Mock des modèles - IMPORTANT: doit être avant les imports des services
jest.mock('../../models/Restaurateur');
jest.mock('../../models/Product');
jest.mock('../../models/Order');

const Restaurateur = require('../../models/Restaurateur');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

describe('Restaurateur Services', () => {
  let mockRestaurateurId;
  let mockRestaurateur;

  beforeEach(() => {
    mockRestaurateurId = new mongoose.Types.ObjectId();
    mockRestaurateur = {
      _id: mockRestaurateurId,
      restaurantName: 'Test Restaurant',
      restaurantType: 'casual',
      email: 'restaurant@example.com',
      save: jest.fn().mockResolvedValue(true)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('restaurateurProfileService', () => {
    describe('updateMyProfile', () => {
      it('devrait mettre à jour le profil du restaurateur', async () => {
        const updateData = {
          restaurantName: 'Updated Restaurant',
          restaurantType: 'fine-dining',
          cuisineTypes: ['french', 'italian']
        };

        const updatedRestaurateur = {
          ...mockRestaurateur,
          ...updateData
        };

        Restaurateur.findByIdAndUpdate.mockResolvedValue(updatedRestaurateur);

        const result = await restaurateurProfileService.updateMyProfile(
          mockRestaurateurId,
          updateData
        );

        expect(Restaurateur.findByIdAndUpdate).toHaveBeenCalled();
        expect(result.restaurantName).toBe('Updated Restaurant');
      });
    });
  });

  describe('restaurateurStatsService', () => {
    describe('getMyStats', () => {
      it('devrait retourner les statistiques du restaurateur', async () => {
        const dishId = new mongoose.Types.ObjectId();
        const mockOrders = [
          {
            status: 'completed',
            total: 100,
            totalPrice: 100,
            items: [{ 
              product: dishId, 
              quantity: 2,
              unitPrice: 50
            }],
            buyer: { _id: new mongoose.Types.ObjectId() }
          }
        ];

        const mockDishes = [
          { _id: dishId, isActive: true, status: 'approved' }
        ];

        const mockDish = {
          _id: dishId,
          name: 'Plat Test',
          category: 'main',
          dishInfo: { category: 'main' }
        };

        // Mock pour Order.find().populate()
        const mockOrderQuery = {
          populate: jest.fn().mockResolvedValue(mockOrders)
        };
        Order.find = jest.fn().mockReturnValue(mockOrderQuery);

        // Mock pour Product.find()
        Product.find = jest.fn().mockResolvedValue(mockDishes);

        // Mock pour Product.findById().select()
        const mockProductQuery = {
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockDish)
        };
        Product.findById = jest.fn().mockReturnValue(mockProductQuery);

        const result = await restaurateurStatsService.getMyStats(mockRestaurateurId);

        expect(result).toBeDefined();
        expect(result.totalOrders).toBe(1);
        expect(result.totalRevenue).toBe(100);
      });
    });

    describe('getStats', () => {
      it('devrait retourner les statistiques simplifiées', async () => {
        const mockOrders = [
          { status: 'completed', total: 150, items: [{ quantity: 1 }] }
        ];

        const mockDishes = [
          { isActive: true, status: 'approved' }
        ];

        Order.find.mockResolvedValue(mockOrders);
        Product.find.mockResolvedValue(mockDishes);

        const result = await restaurateurStatsService.getStats(mockRestaurateurId);

        expect(result.totalRevenue).toBe(150);
        expect(result.totalProducts).toBe(1);
      });
    });
  });

  describe('restaurateurDishService', () => {
    describe('addDish', () => {
      it('devrait créer un nouveau plat', async () => {
        const dishData = {
          name: 'Test Dish',
          description: 'A test dish',
          price: 15.99,
          category: 'main'
        };

        Restaurateur.findById.mockResolvedValue(mockRestaurateur);
        Product.create.mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          ...dishData
        });

        const result = await restaurateurDishService.addDish(mockRestaurateurId, dishData);

        expect(Product.create).toHaveBeenCalled();
        expect(result.name).toBe('Test Dish');
      });

      it('devrait lancer une erreur si le nom ou le prix manque', async () => {
        const dishData = {
          description: 'A test dish'
        };

        Restaurateur.findById.mockResolvedValue(mockRestaurateur);

        await expect(
          restaurateurDishService.addDish(mockRestaurateurId, dishData)
        ).rejects.toThrow('Le nom et le prix sont requis');
      });
    });
  });

  describe('restaurateurSearchService', () => {
    describe('getAllRestaurateurs', () => {
      it('devrait retourner tous les restaurateurs avec pagination', async () => {
        const mockRestaurateurs = [mockRestaurateur];

        Restaurateur.find.mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockRestaurateurs)
        });
        Restaurateur.countDocuments.mockResolvedValue(1);

        const result = await restaurateurSearchService.getAllRestaurateurs({
          page: 1,
          limit: 10
        });

        expect(result.restaurateurs).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
      });
    });

    describe('getRestaurateur', () => {
      it('devrait retourner un restaurateur par ID', async () => {
        Restaurateur.findOne.mockResolvedValue(mockRestaurateur);

        const result = await restaurateurSearchService.getRestaurateur(mockRestaurateurId.toString());

        expect(Restaurateur.findOne).toHaveBeenCalled();
        expect(result).toEqual(mockRestaurateur);
      });

      it('devrait lancer une erreur si le restaurateur n\'existe pas', async () => {
        Restaurateur.findOne.mockResolvedValue(null);

        await expect(
          restaurateurSearchService.getRestaurateur(mockRestaurateurId.toString())
        ).rejects.toThrow('Restaurateur non trouvé');
      });
    });
  });
});

