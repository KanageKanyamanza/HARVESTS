const Consumer = require('../../models/Consumer');
const Producer = require('../../models/Producer');
const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des producteurs/transformateurs favoris du consommateur
 */

async function getFavoriteProducers(consumerId) {
  const consumer = await Consumer.findById(consumerId)
    .select('favoriteProducers')
    .populate('favoriteProducers', 'farmName firstName lastName address salesStats');
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.favoriteProducers || [];
}

async function addFavorite(consumerId, producerId, userType = 'producer') {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  // Vérifier que le producteur/transformateur existe
  if (userType === 'producer') {
    const producer = await Producer.findById(producerId);
    if (!producer) {
      throw new Error('Producteur non trouvé');
    }
    
    if (!consumer.favoriteProducers) {
      consumer.favoriteProducers = [];
    }
    
    if (consumer.favoriteProducers.includes(producerId)) {
      throw new Error('Producteur déjà dans les favoris');
    }
    
    consumer.favoriteProducers.push(producerId);
  } else if (userType === 'transformer') {
    const transformer = await Transformer.findById(producerId);
    if (!transformer) {
      throw new Error('Transformateur non trouvé');
    }
    
    if (!consumer.favoriteTransformers) {
      consumer.favoriteTransformers = [];
    }
    
    if (consumer.favoriteTransformers.includes(producerId)) {
      throw new Error('Transformateur déjà dans les favoris');
    }
    
    consumer.favoriteTransformers.push(producerId);
  }
  
  await consumer.save();
}

async function removeFavorite(consumerId, producerId, userType = 'producer') {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (userType === 'producer') {
    consumer.favoriteProducers.pull(producerId);
  } else if (userType === 'transformer') {
    consumer.favoriteTransformers.pull(producerId);
  }
  
  await consumer.save();
}

module.exports = {
  getFavoriteProducers,
  addFavorite,
  removeFavorite
};

