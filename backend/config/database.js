const mongoose = require('mongoose');

/**
 * Établit la connexion à MongoDB
 * Configure les événements de connexion et la fermeture gracieuse
 */
const connectDB = async () => {
  try {
    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );

    const conn = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Garder en essayant d'envoyer des opérations pendant 5 secondes
      socketTimeoutMS: 45000, // Fermer les sockets après 45 secondes d'inactivité
      family: 4 // Utiliser IPv4, ignorer IPv6
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);

    // Événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connecté à la base de données');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose déconnecté');
    });

    // Fermeture gracieuse
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée via SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
