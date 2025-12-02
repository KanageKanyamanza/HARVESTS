const Order = require('../../../models/Order');
const Transporter = require('../../../models/Transporter');
const Exporter = require('../../../models/Exporter');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

// Obtenir les transporteurs disponibles pour une zone de livraison
exports.getAvailableTransporters = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const { region, city } = req.query;

  // Récupérer la commande pour obtenir la zone de livraison et le type de commande
  let order = null;
  if (orderId) {
    order = await Order.findById(orderId)
      .select('delivery.deliveryAddress delivery.pickupAddress delivery.deliveryFeeDetail billingAddress buyer isExport exportInfo seller')
      .populate('buyer', 'address country region city')
      .populate('seller', 'country');
    
    if (!order) {
      return next(new AppError('Commande non trouvée', 404));
    }
  }

  // Déterminer la région et la ville à partir de la commande ou des paramètres
  let deliveryRegion = region;
  let deliveryCity = city;

  if (order) {
    if (order.delivery?.deliveryAddress?.region) {
      deliveryRegion = order.delivery.deliveryAddress.region;
      deliveryCity = order.delivery.deliveryAddress.city || deliveryCity;
    } else if (order.delivery?.pickupAddress?.region) {
      deliveryRegion = order.delivery.pickupAddress.region;
      deliveryCity = order.delivery.pickupAddress.city || deliveryCity;
    } else if (order.billingAddress?.region) {
      deliveryRegion = order.billingAddress.region;
      deliveryCity = order.billingAddress.city || deliveryCity;
    } else if (order.buyer) {
      if (order.buyer.region || order.buyer.address?.region) {
        deliveryRegion = order.buyer.region || order.buyer.address?.region;
        deliveryCity = order.buyer.city || order.buyer.address?.city || deliveryCity;
      }
    }
  }

  // Si aucune région n'est trouvée, retourner tous les transporteurs disponibles
  if (!deliveryRegion) {
    const allTransporters = await Transporter.find({
      userType: 'transporter',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    })
      .select('firstName lastName email phone companyName serviceAreas performanceStats userType')
      .sort('-performanceStats.onTimeDeliveryRate -performanceStats.averageRating')
      .limit(50);

    const formattedTransporters = allTransporters.map(transporter => ({
      _id: transporter._id,
      userId: transporter._id,
      userType: 'transporter',
      companyName: transporter.companyName || 'Transporteur',
      firstName: transporter.firstName || '',
      lastName: transporter.lastName || '',
      email: transporter.email || '',
      phone: transporter.phone || '',
      serviceAreas: transporter.serviceAreas || [],
      performance: {
        onTimeDeliveryRate: transporter.performanceStats?.onTimeDeliveryRate || 0,
        averageRating: transporter.performanceStats?.averageRating || 0,
        totalDeliveries: transporter.performanceStats?.totalDeliveries || 0
      }
    }));

    return res.status(200).json({
      status: 'success',
      results: formattedTransporters.length,
      message: 'Aucune région de livraison trouvée dans la commande. Tous les transporteurs actifs sont retournés.',
      data: {
        transporters: formattedTransporters,
        deliveryZone: {
          region: null,
          city: null,
          warning: 'Région de livraison non spécifiée dans la commande'
        }
      }
    });
  }

  // Récupérer les transporteurs et exportateurs actifs
  let transporters = await Transporter.find({
    userType: 'transporter',
    isActive: true,
    isApproved: true,
    isEmailVerified: true
  })
    .select('firstName lastName email phone companyName serviceAreas performanceStats userType isActive isApproved isEmailVerified')
    .sort('-performanceStats.onTimeDeliveryRate -performanceStats.averageRating')
    .limit(100);

  let exporters = await Exporter.find({
    userType: 'exporter',
    isActive: true,
    isApproved: true,
    isEmailVerified: true
  })
    .select('firstName lastName email phone companyName userType isActive isApproved isEmailVerified')
    .limit(50);

  // Déterminer si la commande est internationale
  const isInternationalOrder = order ? (
    order.isExport === true ||
    (order.exportInfo && order.exportInfo.destinationCountry) ||
    (order.delivery?.deliveryFeeDetail?.scope === 'international') ||
    (order.delivery?.deliveryAddress?.country && order.seller?.country && 
     order.delivery.deliveryAddress.country !== order.seller.country)
  ) : false;

  // Filtrer les livreurs selon le type de commande
  let allDeliverers = [];
  
  if (isInternationalOrder) {
    allDeliverers = exporters.map(e => ({ ...e.toObject(), userType: 'exporter', serviceAreas: [] }));
  } else {
    allDeliverers = transporters.map(t => ({ ...t.toObject(), userType: 'transporter' }));
  }

  // Normaliser les chaînes pour la comparaison
  const normalizeString = (str) => {
    if (!str) return '';
    return str.toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  };

  // Filtrer et formater les résultats
  const availableTransporters = allDeliverers
    .filter(deliverer => {
      if (deliverer.userType === 'exporter') {
        return true;
      }

      if (!deliverer.serviceAreas || deliverer.serviceAreas.length === 0) {
        return true;
      }

      if (!deliveryRegion) {
        return true;
      }

      const normalizedDeliveryRegion = normalizeString(deliveryRegion);
      const normalizedDeliveryCity = deliveryCity ? normalizeString(deliveryCity) : null;

      const hasMatchingArea = deliverer.serviceAreas.some(area => {
        if (!area || !area.region) return false;
        
        const normalizedAreaRegion = normalizeString(area.region);
        const regionMatch = normalizedAreaRegion === normalizedDeliveryRegion;
        
        let cityMatch = true;
        if (normalizedDeliveryCity) {
          if (area.cities && Array.isArray(area.cities) && area.cities.length > 0) {
            cityMatch = area.cities.some(city => {
              const normalizedCity = normalizeString(city);
              return normalizedCity === normalizedDeliveryCity;
            });
          } else {
            cityMatch = regionMatch;
          }
        }
        
        return regionMatch && cityMatch;
      });
      
      return hasMatchingArea;
    })
    .map(deliverer => ({
      _id: deliverer._id,
      userId: deliverer._id,
      userType: deliverer.userType || 'transporter',
      companyName: deliverer.companyName || (deliverer.userType === 'exporter' ? 'Exportateur' : 'Transporteur'),
      firstName: deliverer.firstName || '',
      lastName: deliverer.lastName || '',
      email: deliverer.email || '',
      phone: deliverer.phone || '',
      serviceAreas: deliverer.serviceAreas ? deliverer.serviceAreas.filter(area => 
        area.region === deliveryRegion
      ) : [],
      performance: deliverer.userType === 'transporter' ? {
        onTimeDeliveryRate: deliverer.performanceStats?.onTimeDeliveryRate || 0,
        averageRating: deliverer.performanceStats?.averageRating || 0,
        totalDeliveries: deliverer.performanceStats?.totalDeliveries || 0
      } : null
    }));

  const delivererType = isInternationalOrder ? 'exportateurs' : 'transporteurs';

  res.status(200).json({
    status: 'success',
    results: availableTransporters.length,
    data: {
      transporters: availableTransporters,
      deliveryZone: {
        region: deliveryRegion,
        city: deliveryCity || null
      },
      orderType: isInternationalOrder ? 'international' : 'local',
      message: isInternationalOrder 
        ? 'Exportateurs disponibles pour commande internationale'
        : 'Transporteurs disponibles pour commande locale'
    }
  });
});

