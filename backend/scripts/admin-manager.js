#!/usr/bin/env node

/**
 * Script de gestion des administrateurs
 * Permet de créer, lister, modifier et supprimer des administrateurs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const Admin = require('../models/Admin');
require('dotenv').config();

// Configuration de la base de données
const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_LOCAL || process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(mongoURI);
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

// Interface de ligne de commande
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Fonction pour valider l'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction pour valider le mot de passe
const isValidPassword = (password) => {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Fonction pour créer un administrateur
const createAdmin = async () => {
  console.log('\n🔧 Création d\'un nouvel administrateur\n');
  
  try {
    const firstName = await question('Prénom: ');
    if (!firstName.trim()) {
      console.log('❌ Le prénom est requis');
      return;
    }

    const lastName = await question('Nom: ');
    if (!lastName.trim()) {
      console.log('❌ Le nom est requis');
      return;
    }

    const email = await question('Email: ');
    if (!isValidEmail(email)) {
      console.log('❌ Format d\'email invalide');
      return;
    }

    // Vérifier si l'email existe déjà
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('❌ Un administrateur avec cet email existe déjà');
      return;
    }

    const password = await question('Mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre): ');
    if (!isValidPassword(password)) {
      console.log('❌ Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    const confirmPassword = await question('Confirmer le mot de passe: ');
    if (password !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas');
      return;
    }

    console.log('\nRôles disponibles:');
    console.log('1. super-admin (accès complet)');
    console.log('2. admin (gestion complète)');
    console.log('3. moderator (modération)');
    console.log('4. support (support client)');
    
    const roleChoice = await question('Choisir le rôle (1-4): ');
    const roles = ['super-admin', 'admin', 'moderator', 'support'];
    const role = roles[parseInt(roleChoice) - 1] || 'moderator';

    console.log('\nDépartements disponibles:');
    console.log('1. technical (Technique)');
    console.log('2. support (Support)');
    console.log('3. marketing (Marketing)');
    console.log('4. finance (Finance)');
    console.log('5. operations (Opérations)');
    
    const deptChoice = await question('Choisir le département (1-5): ');
    const departments = ['technical', 'support', 'marketing', 'finance', 'operations'];
    const department = departments[parseInt(deptChoice) - 1] || 'support';

    const phone = await question('Téléphone (optionnel): ');

    // Obtenir les permissions par défaut
    const permissions = Admin.getDefaultPermissions(role);

    // Créer l'admin
    const admin = await Admin.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      role,
      department,
      phone: phone.trim() || undefined,
      permissions,
      isEmailVerified: true // Auto-vérifier pour les admins créés via script
    });

    console.log('\n✅ Administrateur créé avec succès!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Nom: ${admin.getFullName()}`);
    console.log(`🔑 Rôle: ${admin.role}`);
    console.log(`🏢 Département: ${admin.department}`);
    console.log(`🔐 Permissions: ${admin.permissions.join(', ')}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  }
};

// Fonction pour lister les administrateurs
const listAdmins = async () => {
  console.log('\n📋 Liste des administrateurs\n');
  
  try {
    const admins = await Admin.find()
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
      .sort({ createdAt: -1 });

    if (admins.length === 0) {
      console.log('Aucun administrateur trouvé');
      return;
    }

    console.log('ID'.padEnd(25) + 'Nom'.padEnd(30) + 'Email'.padEnd(35) + 'Rôle'.padEnd(15) + 'Statut');
    console.log('-'.repeat(120));

    admins.forEach(admin => {
      const id = admin._id.toString().substring(0, 24);
      const name = admin.getFullName().substring(0, 29);
      const email = admin.email.substring(0, 34);
      const role = admin.role.substring(0, 14);
      const status = admin.isActive ? '✅ Actif' : '❌ Inactif';
      
      console.log(id.padEnd(25) + name.padEnd(30) + email.padEnd(35) + role.padEnd(15) + status);
    });

    console.log(`\nTotal: ${admins.length} administrateur(s)`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error.message);
  }
};

// Fonction pour modifier un administrateur
const updateAdmin = async () => {
  console.log('\n✏️ Modification d\'un administrateur\n');
  
  try {
    const email = await question('Email de l\'administrateur à modifier: ');
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Administrateur non trouvé');
      return;
    }

    console.log(`\nAdministrateur trouvé: ${admin.getFullName()} (${admin.role})`);
    
    const newFirstName = await question(`Nouveau prénom [${admin.firstName}]: `);
    const newLastName = await question(`Nouveau nom [${admin.lastName}]: `);
    const newPhone = await question(`Nouveau téléphone [${admin.phone || 'Aucun'}]: `);
    
    console.log('\nRôles disponibles:');
    console.log('1. super-admin');
    console.log('2. admin');
    console.log('3. moderator');
    console.log('4. support');
    
    const roleChoice = await question(`Nouveau rôle [${admin.role}] (1-4 ou Entrée pour garder): `);
    const roles = ['super-admin', 'admin', 'moderator', 'support'];
    const newRole = roleChoice ? roles[parseInt(roleChoice) - 1] : admin.role;

    const statusChoice = await question(`Statut [${admin.isActive ? 'actif' : 'inactif'}] (a/i ou Entrée pour garder): `);
    const newStatus = statusChoice === 'a' ? true : statusChoice === 'i' ? false : admin.isActive;

    // Mettre à jour
    const updateData = {};
    if (newFirstName.trim()) updateData.firstName = newFirstName.trim();
    if (newLastName.trim()) updateData.lastName = newLastName.trim();
    if (newPhone.trim()) updateData.phone = newPhone.trim();
    if (newRole) updateData.role = newRole;
    updateData.isActive = newStatus;

    // Mettre à jour les permissions si le rôle a changé
    if (newRole && newRole !== admin.role) {
      updateData.permissions = Admin.getDefaultPermissions(newRole);
    }

    await Admin.findByIdAndUpdate(admin._id, updateData);

    console.log('\n✅ Administrateur mis à jour avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la modification:', error.message);
  }
};

// Fonction pour supprimer un administrateur
const deleteAdmin = async () => {
  console.log('\n🗑️ Suppression d\'un administrateur\n');
  
  try {
    const email = await question('Email de l\'administrateur à supprimer: ');
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Administrateur non trouvé');
      return;
    }

    console.log(`\nAdministrateur trouvé: ${admin.getFullName()} (${admin.role})`);
    
    // Vérifier s'il reste des super-admin
    if (admin.role === 'super-admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
      if (superAdminCount <= 1) {
        console.log('❌ Impossible de supprimer le dernier super-administrateur');
        return;
      }
    }

    const confirm = await question('Êtes-vous sûr de vouloir supprimer cet administrateur? (oui/non): ');
    if (confirm.toLowerCase() !== 'oui') {
      console.log('Suppression annulée');
      return;
    }

    await Admin.findByIdAndDelete(admin._id);
    console.log('\n✅ Administrateur supprimé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
  }
};

// Fonction pour réinitialiser un mot de passe
const resetPassword = async () => {
  console.log('\n🔐 Réinitialisation du mot de passe\n');
  
  try {
    const email = await question('Email de l\'administrateur: ');
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Administrateur non trouvé');
      return;
    }

    console.log(`\nAdministrateur trouvé: ${admin.getFullName()}`);
    
    const newPassword = await question('Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre): ');
    if (!isValidPassword(newPassword)) {
      console.log('❌ Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    const confirmPassword = await question('Confirmer le nouveau mot de passe: ');
    if (newPassword !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas');
      return;
    }

    admin.password = newPassword;
    admin.lastPasswordChange = new Date();
    await admin.save();

    console.log('\n✅ Mot de passe réinitialisé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
  }
};

// Fonction pour afficher les statistiques
const showStats = async () => {
  console.log('\n📊 Statistiques des administrateurs\n');
  
  try {
    const stats = await Admin.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          byRole: { $push: { role: '$role', isActive: '$isActive' } }
        }
      },
      {
        $project: {
          total: 1,
          active: 1,
          inactive: 1,
          superAdmins: {
            $size: {
              $filter: {
                input: '$byRole',
                cond: { $eq: ['$$this.role', 'super-admin'] }
              }
            }
          },
          admins: {
            $size: {
              $filter: {
                input: '$byRole',
                cond: { $eq: ['$$this.role', 'admin'] }
              }
            }
          },
          moderators: {
            $size: {
              $filter: {
                input: '$byRole',
                cond: { $eq: ['$$this.role', 'moderator'] }
              }
            }
          },
          support: {
            $size: {
              $filter: {
                input: '$byRole',
                cond: { $eq: ['$$this.role', 'support'] }
              }
            }
          }
        }
      }
    ]);

    const stat = stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      superAdmins: 0,
      admins: 0,
      moderators: 0,
      support: 0
    };

    console.log(`Total: ${stat.total}`);
    console.log(`Actifs: ${stat.active}`);
    console.log(`Inactifs: ${stat.inactive}`);
    console.log(`\nPar rôle:`);
    console.log(`  Super-admins: ${stat.superAdmins}`);
    console.log(`  Admins: ${stat.admins}`);
    console.log(`  Modérateurs: ${stat.moderators}`);
    console.log(`  Support: ${stat.support}`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error.message);
  }
};

// Menu principal
const showMenu = () => {
  console.log('\n🔧 Gestionnaire d\'Administrateurs');
  console.log('=====================================');
  console.log('1. Créer un administrateur');
  console.log('2. Lister les administrateurs');
  console.log('3. Modifier un administrateur');
  console.log('4. Supprimer un administrateur');
  console.log('5. Réinitialiser un mot de passe');
  console.log('6. Afficher les statistiques');
  console.log('7. Quitter');
  console.log('=====================================');
};

// Fonction principale
const main = async () => {
  try {
    await connectDB();
    
    while (true) {
      showMenu();
      const choice = await question('\nChoisir une option (1-7): ');
      
      switch (choice) {
        case '1':
          await createAdmin();
          break;
        case '2':
          await listAdmins();
          break;
        case '3':
          await updateAdmin();
          break;
        case '4':
          await deleteAdmin();
          break;
        case '5':
          await resetPassword();
          break;
        case '6':
          await showStats();
          break;
        case '7':
          console.log('\n👋 Au revoir!');
          process.exit(0);
        default:
          console.log('❌ Option invalide');
      }
      
      await question('\nAppuyez sur Entrée pour continuer...');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Gestion des arguments de ligne de commande
if (process.argv.length > 2) {
  const command = process.argv[2];
  
  (async () => {
    await connectDB();
    
    switch (command) {
      case 'create':
        await createAdmin();
        break;
      case 'list':
        await listAdmins();
        break;
      case 'stats':
        await showStats();
        break;
      default:
        console.log('Commandes disponibles: create, list, stats');
    }
    
    process.exit(0);
  })();
} else {
  main();
}
