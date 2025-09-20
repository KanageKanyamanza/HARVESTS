// Configuration spécifique au Sénégal

const SENEGAL_CONFIG = {
  // 🇸🇳 Informations pays
  country: {
    name: 'Sénégal',
    code: 'SN',
    phonePrefix: '+221',
    currency: 'XOF',
    language: 'fr'
  },
  
  // 🏛️ Régions administratives
  regions: [
    'Dakar',
    'Thiès', 
    'Saint-Louis',
    'Diourbel',
    'Louga',
    'Fatick',
    'Kaolack',
    'Kolda',
    'Ziguinchor',
    'Tambacounda',
    'Kaffrine',
    'Kédougou',
    'Matam',
    'Sédhiou'
  ],
  
  // 🏙️ Principales villes
  cities: {
    'Dakar': ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
    'Thiès': ['Thiès', 'Mbour', 'Tivaouane'],
    'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor'],
    'Diourbel': ['Diourbel', 'Touba', 'Mbacké'],
    'Kaolack': ['Kaolack', 'Nioro du Rip', 'Foundiougne'],
    'Ziguinchor': ['Ziguinchor', 'Oussouye', 'Bignona']
  },
  
  // 📱 Opérateurs mobile money Sénégal
  mobileMoneyProviders: [
    {
      name: 'Wave',
      code: 'wave',
      prefixes: ['77', '78', '76', '70'], // Tous opérateurs supportés
      apiUrl: 'https://api.wave.com/v1',
      currency: 'XOF',
      marketShare: '60%', // Leader au Sénégal
      features: ['paiement', 'retrait', 'transfert', 'factures']
    },
    {
      name: 'Orange Money',
      code: 'orange',
      prefixes: ['77', '78'],
      apiUrl: 'https://api.orange.com/orange-money-webpay/sn/v1',
      currency: 'XOF',
      marketShare: '25%'
    },
    {
      name: 'Free Money', 
      code: 'free',
      prefixes: ['76'],
      currency: 'XOF',
      marketShare: '10%'
    },
    {
      name: 'Expresso Money',
      code: 'expresso', 
      prefixes: ['70'],
      currency: 'XOF',
      marketShare: '5%'
    }
  ],
  
  // 🌾 Produits agricoles typiques
  localProducts: {
    cereals: [
      { name: 'Mil', season: 'octobre-novembre', regions: ['Thiès', 'Diourbel', 'Louga'] },
      { name: 'Sorgho', season: 'octobre-novembre', regions: ['Tambacounda', 'Kolda'] },
      { name: 'Maïs', season: 'septembre-octobre', regions: ['Casamance', 'Kolda'] },
      { name: 'Riz', season: 'novembre-décembre', regions: ['Saint-Louis', 'Matam'] }
    ],
    vegetables: [
      { name: 'Tomate', season: 'décembre-mai', regions: ['Niayes', 'Saint-Louis'] },
      { name: 'Oignon', season: 'mars-juin', regions: ['Saint-Louis', 'Matam'] },
      { name: 'Pomme de terre', season: 'janvier-avril', regions: ['Niayes', 'Thiès'] },
      { name: 'Carotte', season: 'décembre-avril', regions: ['Niayes'] }
    ],
    fruits: [
      { name: 'Mangue', season: 'avril-juillet', regions: ['Casamance', 'Tambacounda'] },
      { name: 'Orange', season: 'décembre-avril', regions: ['Niayes', 'Casamance'] },
      { name: 'Banane', season: 'toute l\'année', regions: ['Casamance'] },
      { name: 'Pastèque', season: 'mars-juin', regions: ['Fleuve', 'Niayes'] }
    ]
  },
  
  // 💰 Configuration économique
  economy: {
    currency: 'XOF',
    exchangeRates: {
      'EUR': 655.957, // Taux fixe CFA/EUR
      'USD': 580.0,   // Approximatif
      'XAF': 1.0      // Parité CFA
    },
    minWage: 60000, // SMIG mensuel en XOF
    averageIncome: 150000 // Revenu moyen mensuel en XOF
  },
  
  // 🚚 Zones de livraison
  deliveryZones: {
    'Dakar': {
      basePrice: 1500,
      freeDeliveryThreshold: 25000,
      maxDistance: 30
    },
    'Thiès': {
      basePrice: 2000,
      freeDeliveryThreshold: 30000,
      maxDistance: 25
    },
    'Saint-Louis': {
      basePrice: 2500,
      freeDeliveryThreshold: 35000,
      maxDistance: 20
    },
    'other': {
      basePrice: 3000,
      freeDeliveryThreshold: 40000,
      maxDistance: 15
    }
  },
  
  // 📞 Format numéros de téléphone
  phoneFormats: {
    mobile: /^221[7][0-8]\d{7}$/, // +221 7X XXX XXXX
    landline: /^221[3][3,8]\d{7}$/, // +221 33 XXX XXXX
    prefixes: {
      orange: ['77', '78'],
      free: ['76'],
      expresso: ['70'],
      tigo: ['75'] // Si disponible
    }
  },
  
  // 🎭 Contexte culturel
  cultural: {
    languages: ['Français', 'Wolof', 'Pulaar', 'Serer', 'Mandinka'],
    greetings: {
      wolof: 'Salamalekoum',
      french: 'Bonjour',
      pulaar: 'Jam weli'
    },
    workingDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    workingHours: {
      start: '08:00',
      end: '17:00',
      break: '12:00-14:00'
    },
    ramadan: true, // Considérer le ramadan
    tabaski: true  // Considérer la Tabaski
  }
};

module.exports = SENEGAL_CONFIG;
