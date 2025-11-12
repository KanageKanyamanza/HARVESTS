const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration Swagger pour Harvests API
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Harvests API - Plateforme Agricole Sénégalaise',
      version: '1.0.0',
      description: `
# 🌾 Harvests API Documentation

**L'Amazon agricole sénégalais** - Connecter producteurs et consommateurs

## 🇸🇳 Spécificités Sénégal
- **Devise** : XOF (Franc CFA Ouest-Africain)
- **Mobile Money** : Wave (60%) + Orange Money (25%)
- **Géographie** : 14 régions, focus Thiès → Dakar
- **Produits** : Mil, riz, légumes Niayes, fruits Casamance

## 🚀 Fonctionnalités
- **Multi-utilisateurs** : 6 types (producteur, consommateur, etc.)
- **E-commerce** : Catalogue, commandes, paiements
- **Sécurité** : JWT, rate limiting, chiffrement
- **Notifications** : Email, push, webhooks
- **Images** : Upload Cloudinary organisé
- **Mobile Money** : Wave + Orange Money intégrés

## 🔗 Liens utiles
- **Frontend** : https://harvests-khaki.vercel.app
- **Admin** : http://localhost:3001
- **Repository** : https://github.com/votre-repo/harvests
      `,
      contact: {
        name: 'Équipe Harvests',
        email: 'info@growthubb.space',
        url: 'https://harvests.sn'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.harvests.sn/v1',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /auth/login'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'Cookie JWT httpOnly'
        }
      },
      schemas: {
        // Schémas de base
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectId' },
            firstName: { type: 'string', example: 'Amadou' },
            lastName: { type: 'string', example: 'Diop' },
            email: { type: 'string', format: 'email', example: 'amadou.diop@test.sn' },
            phone: { type: 'string', example: '+221771234567' },
            userType: { 
              type: 'string', 
              enum: ['producer', 'consumer', 'transformer', 'restaurateur', 'exporter', 'transporter']
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Quartier Médina' },
                city: { type: 'string', example: 'Thiès' },
                region: { type: 'string', example: 'Thiès' },
                country: { type: 'string', example: 'Sénégal' },
                postalCode: { type: 'string', example: '21000' }
              }
            },
            currency: { type: 'string', enum: ['XOF', 'EUR', 'USD', 'XAF'], default: 'XOF' },
            language: { type: 'string', enum: ['fr', 'en', 'es'], default: 'fr' },
            isActive: { type: 'boolean', default: true },
            emailVerified: { type: 'boolean', default: false },
            accountApproved: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        Producer: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                farmName: { type: 'string', example: 'Ferme Bio Diop & Frères' },
                farmSize: {
                  type: 'object',
                  properties: {
                    value: { type: 'number', example: 15 },
                    unit: { type: 'string', enum: ['hectares', 'acres', 'm²'], default: 'hectares' }
                  }
                },
                farmingType: { type: 'string', enum: ['organic', 'conventional', 'mixed'] },
                crops: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'mil' },
                      category: { type: 'string', enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs'] },
                      plantingSeasons: { type: 'array', items: { type: 'string' } },
                      harvestSeasons: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          ]
        },
        
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectId' },
            name: { type: 'string', example: 'Mil Rouge Bio de Thiès' },
            description: { type: 'string', example: 'Mil rouge cultivé selon les méthodes bio...' },
            producer: { type: 'string', format: 'objectId' },
            category: { 
              type: 'string', 
              enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs', 'nuts', 'seeds', 'dairy', 'meat', 'poultry', 'fish', 'processed-foods', 'beverages', 'other']
            },
            subcategory: { type: 'string', example: 'millet' },
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Sac 10kg' },
                  price: { type: 'number', example: 8500 },
                  weight: {
                    type: 'object',
                    properties: {
                      value: { type: 'number', example: 10 },
                      unit: { type: 'string', enum: ['g', 'kg', 'lb', 'oz'], default: 'kg' }
                    }
                  },
                  inventory: {
                    type: 'object',
                    properties: {
                      quantity: { type: 'number', example: 30 },
                      lowStockAlert: { type: 'number', example: 5 }
                    }
                  }
                }
              }
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', format: 'uri' },
                  alt: { type: 'string' },
                  isPrimary: { type: 'boolean' }
                }
              }
            },
            status: { 
              type: 'string', 
              enum: ['draft', 'pending-review', 'approved', 'rejected', 'inactive'],
              default: 'draft'
            },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectId' },
            orderNumber: { type: 'string', example: 'HRV-SN-2025-001' },
            buyer: { type: 'string', format: 'objectId' },
            seller: { type: 'string', format: 'objectId' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', format: 'objectId' },
                  variant: { type: 'string', format: 'objectId' },
                  quantity: { type: 'number', example: 2 },
                  unitPrice: { type: 'number', example: 8500 },
                  totalPrice: { type: 'number', example: 17000 }
                }
              }
            },
            subtotal: { type: 'number', example: 17000 },
            shippingCost: { type: 'number', example: 1500 },
            total: { type: 'number', example: 18500 },
            payment: {
              type: 'object',
              properties: {
                    method: { type: 'string', enum: ['cash', 'paypal'] },
                provider: { type: 'string', example: 'Wave Sénégal' },
                status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'] },
                amount: { type: 'number', example: 18500 },
                currency: { type: 'string', example: 'XOF' }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready-for-pickup', 'in-transit', 'delivered', 'cancelled', 'refunded']
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Message d\'erreur' },
            message: { type: 'string', example: 'Description détaillée' },
            statusCode: { type: 'number', example: 400 }
          }
        },
        
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Opération réussie' }
          }
        }
      },
      
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Numéro de page (commence à 1)',
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        LimitParam: {
          name: 'limit',
          in: 'query', 
          description: 'Nombre d\'éléments par page',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Champ de tri (préfixer par - pour ordre décroissant)',
          schema: { type: 'string', example: '-createdAt' }
        }
      },
      
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Non autorisé',
                message: 'Token JWT manquant ou invalide',
                statusCode: 401
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Données invalides',
                message: 'Email requis',
                statusCode: 400
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Non trouvé',
                message: 'Utilisateur non trouvé',
                statusCode: 404
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: '🔐 Authentification et autorisation'
      },
      {
        name: 'Users',
        description: '👥 Gestion des utilisateurs'
      },
      {
        name: 'Producers',
        description: '👨‍🌾 Gestion des producteurs'
      },
      {
        name: 'Consumers', 
        description: '🛒 Gestion des consommateurs'
      },
      {
        name: 'Products',
        description: '🌾 Catalogue de produits'
      },
      {
        name: 'Orders',
        description: '📦 Gestion des commandes'
      },
      {
        name: 'Payments',
        description: '💳 Paiements (Wave, Orange Money, Stripe)'
      },
      {
        name: 'Reviews',
        description: '⭐ Avis et évaluations'
      },
      {
        name: 'Notifications',
        description: '🔔 Notifications multi-canal'
      },
      {
        name: 'Messages',
        description: '💬 Chat et messagerie'
      },
      {
        name: 'Upload',
        description: '📸 Upload d\'images (Cloudinary)'
      },
      {
        name: 'Webhooks',
        description: '🔗 Intégrations webhooks'
      },
      {
        name: 'Admin',
        description: '⚙️ Administration'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

// Générer la spécification Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configuration de l'interface Swagger UI
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2E7D32; }
    .swagger-ui .scheme-container { background: #E8F5E8; }
    .swagger-ui .info .description p { color: #555; }
    .swagger-ui .opblock.opblock-post { border-color: #4CAF50; }
    .swagger-ui .opblock.opblock-get { border-color: #2196F3; }
    .swagger-ui .opblock.opblock-put { border-color: #FF9800; }
    .swagger-ui .opblock.opblock-delete { border-color: #F44336; }
  `,
  customSiteTitle: 'Harvests API - Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

// Middleware pour servir Swagger
const setupSwagger = (app) => {
  // Documentation JSON brute
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  // Interface Swagger UI
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Redirection depuis la racine
  app.get('/docs', (req, res) => {
    res.redirect('/api/docs');
  });
  
  console.log('📖 Swagger UI disponible sur: http://localhost:8000/api/docs');
  console.log('📄 Spécification JSON: http://localhost:8000/api/docs.json');
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
  setupSwagger
};
