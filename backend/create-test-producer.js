const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const Producer = require('./models/Producer');

const createTestProducer = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si le producteur existe déjà
    const existingProducer = await Producer.findOne({ email: 'producer@test.com' });
    if (existingProducer) {
      console.log('ℹ️ Producteur de test existe déjà');
      console.log('Email:', existingProducer.email);
      console.log('ID:', existingProducer._id);
      return;
    }

    // Créer le producteur de test
    const producerData = {
      email: 'producer@test.com',
      password: 'password123', // Le middleware de User va hasher automatiquement
      firstName: 'Test',
      lastName: 'Producer',
      phone: '+221701234567',
      country: 'SN',
      userType: 'producer',
      isActive: true,
      isApproved: true,
      emailVerified: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      businessInfo: {
        businessName: 'Ferme Test',
        businessType: 'agriculture',
        registrationNumber: 'TEST123456',
        taxId: 'TAX123456'
      },
      address: 'Avenue Test, Dakar, Sénégal',
      crops: [
        { name: 'riz', variety: 'riz blanc', season: 'saison sèche' },
        { name: 'maïs', variety: 'maïs jaune', season: 'saison des pluies' },
        { name: 'tomates', variety: 'tomates cerises', season: 'toute l\'année' }
      ],
      farmSize: {
        value: 7,
        unit: 'hectares'
      },
      experience: '5-10 ans',
      certifications: [
        { name: 'Agriculture Biologique', issuedBy: 'Ministère de l\'Agriculture', validUntil: new Date('2025-12-31') }
      ],
      languages: ['fr', 'en']
    };

    const producer = new Producer(producerData);
    producer.password = 'password123'; // S'assurer que le password est défini
    producer.markModified('password'); // Forcer la modification
    await producer.save();

    console.log('✅ Producteur de test créé avec succès');
    console.log('Email:', producer.email);
    console.log('ID:', producer._id);
    console.log('Mot de passe: password123');

  } catch (error) {
    console.error('❌ Erreur lors de la création du producteur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

createTestProducer();
