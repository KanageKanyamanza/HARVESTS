const mongoose = require('mongoose');
const { productSchema } = require('./productSchemas');
const addProductIndexes = require('./productIndexes');
const addProductVirtuals = require('./productVirtuals');
const addProductMiddleware = require('./productMiddleware');
const addProductMethods = require('./productMethods');
const addProductStatics = require('./productStatics');

// Ajouter les index
addProductIndexes(productSchema);

// Ajouter les virtuals
addProductVirtuals(productSchema);

// Ajouter les middleware
addProductMiddleware(productSchema);

// Ajouter les méthodes d'instance
addProductMethods(productSchema);

// Ajouter les méthodes statiques
addProductStatics(productSchema);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

