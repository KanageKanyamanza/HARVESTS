/**
 * @swagger
 * components:
 *   examples:
 *     ProducerSenegal:
 *       summary: Producteur sénégalais type
 *       value:
 *         firstName: Amadou
 *         lastName: Diop
 *         email: amadou.diop@test.sn
 *         phone: "+221771234567"
 *         address:
 *           street: Quartier Médina
 *           city: Thiès
 *           region: Thiès
 *           country: Sénégal
 *           postalCode: "21000"
 *         farmName: Ferme Bio Diop & Frères
 *         farmSize:
 *           value: 15
 *           unit: hectares
 *         farmingType: organic
 *         currency: XOF
 *     
 *     ConsumerSenegal:
 *       summary: Consommateur sénégalais type
 *       value:
 *         firstName: Aïssatou
 *         lastName: Ba
 *         email: aissatou.ba@test.sn
 *         phone: "+221781234567"
 *         address:
 *           street: Plateau, Avenue Léopold Sédar Senghor
 *           city: Dakar
 *           region: Dakar
 *           country: Sénégal
 *           postalCode: "10000"
 *         dietaryPreferences: ["organic", "local", "halal"]
 *         currency: XOF
 *     
 *     ProductSenegal:
 *       summary: Produit agricole sénégalais
 *       value:
 *         name: Mil Rouge Bio de Thiès
 *         description: Mil rouge cultivé selon les méthodes traditionnelles bio dans la région de Thiès
 *         category: cereals
 *         subcategory: millet
 *         variants:
 *           - name: Sac 10kg
 *             price: 8500
 *             weight:
 *               value: 10
 *               unit: kg
 *             inventory:
 *               quantity: 30
 *               lowStockAlert: 5
 *         tags: ["bio", "cereales", "local", "senegal", "thies"]
 *         status: approved
 *     
 *     OrderSenegal:
 *       summary: Commande sénégalaise avec Wave
 *       value:
 *         orderNumber: HRV-SN-2025-001
 *         items:
 *           - product: "60f1b2b3c4d5e6f7g8h9i0j1"
 *             quantity: 2
 *             unitPrice: 8500
 *             totalPrice: 17000
 *         subtotal: 17000
 *         shippingCost: 1500
 *         total: 18500
 *         payment:
 *           method: mobile-money
 *           provider: Wave Sénégal
 *           currency: XOF
 *           amount: 18500
 *         deliveryAddress:
 *           street: Plateau, Avenue Léopold Sédar Senghor
 *           city: Dakar
 *           region: Dakar
 *           country: Sénégal
 *     
 *     WavePayment:
 *       summary: Paiement Wave
 *       value:
 *         phone: "+221771234567"
 *         amount: 18500
 *         currency: XOF
 *         provider: wave
 *     
 *     OrangeMoneyPayment:
 *       summary: Paiement Orange Money
 *       value:
 *         phone: "+221781234567"
 *         amount: 18500
 *         currency: XOF
 *         provider: orange_money
 */
