const Order = require('../../models/Order');
const Product = require('../../models/Product');
const catchAsync = require('../../utils/catchAsync');
const { toPlainText } = require('../../utils/localization');

// Créer une commande de test (développement uniquement)
exports.createTestOrder = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ producer: req.user._id });
  
  const orderData = {
    orderNumber: `TEST-${Date.now()}`,
    buyer: req.user._id,
    seller: req.user._id,
    items: product ? [{
      product: product._id,
      quantity: 2,
      unitPrice: product.price || 1000,
      totalPrice: (product.price || 1000) * 2,
      productSnapshot: {
        name: toPlainText(product.name, 'Produit de test'),
        description: toPlainText(product.description, 'Description de test')
      }
    }] : [{
      product: null,
      quantity: 1,
      unitPrice: 1000,
      totalPrice: 1000,
      productSnapshot: { name: 'Produit de test', description: 'Commande de test sans produit réel' }
    }],
    total: product ? (product.price || 1000) * 2 : 1000,
    status: 'pending',
    paymentMethod: 'cash',
    delivery: {
      method: 'standard-delivery',
      deliveryFee: 0,
      deliveryAddress: {
        firstName: 'Test', lastName: 'User', street: 'Test Street',
        city: 'Dakar', region: 'Dakar', country: 'Sénégal',
        postalCode: '00000', phone: '+221000000000'
      }
    }
  };

  const testOrder = await Order.create(orderData);
  await testOrder.populate('buyer', 'firstName lastName email');
  await testOrder.populate('seller', 'firstName lastName');
  await testOrder.populate('items.product', 'name images');

  res.status(201).json({
    status: 'success',
    message: 'Commande de test créée',
    data: { order: testOrder }
  });
});

