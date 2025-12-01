const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Producer = require('../../models/Producer');
const Consumer = require('../../models/Consumer');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

// NOTE: Les configurations email et PayPal sont définies dans tests/setup.js
// Les variables d'environnement sont configurées automatiquement pour éviter les erreurs de connexion

describe('Test E2E: Ajout de produit et achat par consommateur', () => {
  let producerToken;
  let consumerToken;
  let producerId;
  let consumerId;
  let productId;
  let orderId;

  beforeAll(async () => {
    // Connexion à la base de données de test
    if (mongoose.connection.readyState === 0) {
      // Priorité à DATABASE_LOCAL comme dans l'environnement de développement
      let mongoUri = process.env.DATABASE_LOCAL || process.env.DATABASE || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/harvests-test';
      
      // Remplacer localhost par 127.0.0.1 pour éviter les problèmes IPv6/IPv4
      mongoUri = mongoUri.replace(/mongodb:\/\/localhost/, 'mongodb://127.0.0.1');
      
      // Utiliser la base de test si ce n'est pas déjà spécifié
      if (!mongoUri.includes('/harvests-test') && !mongoUri.includes('/harvests')) {
        mongoUri = mongoUri.replace(/\/[^\/]*$/, '/harvests-test');
      }
      
      console.log(`🔗 Tentative de connexion à: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
      
      try {
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          family: 4 // Forcer IPv4
        });
        console.log('✅ Connexion MongoDB réussie pour les tests E2E');
        console.log(`📊 Base de données: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
      } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        console.error(`❌ URI utilisée: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
        throw new Error(`Impossible de se connecter à MongoDB: ${error.message}. Assurez-vous que MongoDB est en cours d'exécution.`);
      }
    }
  }, 30000);

  afterAll(async () => {
    // Nettoyage
    try {
      if (productId) {
        await Product.deleteMany({ _id: productId });
      }
      if (orderId) {
        await Order.deleteMany({ _id: orderId });
      }
      await User.deleteMany({ email: { $in: ['test-producer@test.com', 'test-consumer@test.com'] } });
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }, 30000);

  describe('1. Création et authentification du producteur', () => {
    test('Devrait créer un producteur', async () => {
      const producerData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'test-producer@test.com',
        password: 'Test1234!',
        passwordConfirm: 'Test1234!',
        userType: 'producer',
        phone: '+2250123456789',
        address: '123 Rue Test',
        city: 'Abidjan',
        region: 'Lagunes',
        country: 'Côte d\'Ivoire'
      };

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(producerData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.userType).toBe('producer');
      producerId = res.body.data.user._id;
    });

    test('Devrait connecter le producteur', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test-producer@test.com',
          password: 'Test1234!'
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      producerToken = res.body.token;
    });
  });

  describe('2. Ajout d\'un produit par le producteur', () => {
    test('Devrait créer un produit', async () => {
      const productData = {
        name: {
          fr: 'Tomates Bio Test',
          en: 'Organic Tomatoes Test'
        },
        description: {
          fr: 'Tomates biologiques fraîches du jardin',
          en: 'Fresh organic tomatoes from the garden'
        },
        category: 'vegetables',
        price: 2500,
        currency: 'XOF',
        unit: 'kg',
        weight: {
          value: 1,
          unit: 'kg'
        },
        inventory: {
          quantity: 100,
          trackQuantity: true
        },
        isOrganic: true,
        isActive: true,
        isPublic: true
      };

      const res = await request(app)
        .post('/api/v1/products/my')
        .set('Authorization', `Bearer ${producerToken}`)
        .send(productData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name.fr).toBe('Tomates Bio Test');
      expect(res.body.data.product.price).toBe(2500);
      productId = res.body.data.product._id;
    });

    test('Devrait récupérer le produit créé', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.product._id).toBe(productId.toString());
      expect(res.body.data.product.price).toBe(2500);
    });
  });

  describe('3. Création et authentification du consommateur', () => {
    test('Devrait créer un consommateur', async () => {
      const consumerData = {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'test-consumer@test.com',
        password: 'Test1234!',
        passwordConfirm: 'Test1234!',
        userType: 'consumer',
        phone: '+2250987654321',
        address: '456 Avenue Test',
        city: 'Abidjan',
        region: 'Lagunes',
        country: 'Côte d\'Ivoire'
      };

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(consumerData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.userType).toBe('consumer');
      consumerId = res.body.data.user._id;
    });

    test('Devrait connecter le consommateur', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test-consumer@test.com',
          password: 'Test1234!'
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      consumerToken = res.body.token;
    });
  });

  describe('4. Estimation des coûts de commande', () => {
    test('Devrait estimer les coûts d\'une commande', async () => {
      const estimateData = {
        items: [
          {
            product: productId,
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: '456 Avenue Test',
          city: 'Abidjan',
          region: 'Lagunes',
          country: 'Côte d\'Ivoire'
        },
        deliveryMethod: 'standard'
      };

      const res = await request(app)
        .post('/api/v1/orders/estimate')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send(estimateData)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.subtotal).toBeDefined();
      expect(res.body.data.total).toBeDefined();
    });
  });

  describe('5. Création d\'une commande par le consommateur', () => {
    test('Devrait créer une commande', async () => {
      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: '456 Avenue Test',
          city: 'Abidjan',
          region: 'Lagunes',
          country: 'Côte d\'Ivoire',
          postalCode: '01 BP 1234'
        },
        billingAddress: {
          street: '456 Avenue Test',
          city: 'Abidjan',
          region: 'Lagunes',
          country: 'Côte d\'Ivoire',
          postalCode: '01 BP 1234'
        },
        paymentMethod: 'mobile-money',
        paymentProvider: 'orange-money',
        deliveryMethod: 'standard',
        currency: 'XOF',
        notes: 'Commande de test E2E'
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.order).toBeDefined();
      expect(res.body.data.order.status).toBe('pending');
      expect(res.body.data.order.items).toHaveLength(1);
      expect(res.body.data.order.items[0].quantity).toBe(2);
      expect(res.body.data.order.total).toBeGreaterThan(0);
      orderId = res.body.data.order._id;
    });

    test('Devrait récupérer la commande créée', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.order._id).toBe(orderId.toString());
      expect(res.body.data.order.customer.toString()).toBe(consumerId.toString());
    });

    test('Devrait lister les commandes du consommateur', async () => {
      const res = await request(app)
        .get('/api/v1/orders/me')
        .set('Authorization', `Bearer ${consumerToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.orders).toBeDefined();
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      const foundOrder = res.body.data.orders.find(o => o._id === orderId.toString());
      expect(foundOrder).toBeDefined();
    });
  });

  describe('6. Vérification côté producteur', () => {
    test('Le producteur devrait voir la commande', async () => {
      const res = await request(app)
        .get('/api/v1/orders/me')
        .set('Authorization', `Bearer ${producerToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.orders).toBeDefined();
      const foundOrder = res.body.data.orders.find(o => o._id === orderId.toString());
      expect(foundOrder).toBeDefined();
    });
  });

  describe('7. Vérification de la cohérence des données', () => {
    test('Le produit devrait avoir la bonne quantité en stock', async () => {
      const product = await Product.findById(productId);
      expect(product).toBeDefined();
      expect(product.inventory.quantity).toBeLessThanOrEqual(100);
    });

    test('La commande devrait être liée au bon produit et consommateur', async () => {
      const order = await Order.findById(orderId)
        .populate('customer')
        .populate('items.product');

      expect(order).toBeDefined();
      expect(order.customer._id.toString()).toBe(consumerId.toString());
      expect(order.items[0].product._id.toString()).toBe(productId.toString());
    });
  });
});

