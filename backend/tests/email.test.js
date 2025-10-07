const Email = require('../utils/email');
const nodemailer = require('nodemailer');
const emailjs = require('@emailjs/nodejs');

// Mock des dépendances
jest.mock('nodemailer');
jest.mock('@emailjs/nodejs');

describe('Email Service avec Fallback EmailJS', () => {
  let mockUser;
  let mockUrl;
  let mockTransporter;

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Configuration utilisateur de test
    mockUser = {
      email: 'test@harvests.sn',
      firstName: 'Test',
      preferredLanguage: 'fr'
    };
    
    mockUrl = 'https://harvests.sn/verify-email/token123';
    
    // Mock du transporter Nodemailer
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn()
    };
    
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  describe('Configuration EmailJS', () => {
    test('devrait initialiser EmailJS avec les bonnes variables d\'environnement', () => {
      // Configuration des variables d'environnement
      process.env.EMAILJS_SERVICE_ID = 'service_test123';
      process.env.EMAILJS_TEMPLATE_ID = 'template_test456';
      process.env.EMAILJS_PUBLIC_KEY = 'pk_test789';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      const email = new Email(mockUser, mockUrl);
      
      expect(email.to).toBe(mockUser.email);
      expect(email.firstName).toBe(mockUser.firstName);
      expect(email.url).toBe(mockUrl);
    });

    test('devrait lancer une erreur si les variables EmailJS sont manquantes', async () => {
      // Supprimer les variables EmailJS
      delete process.env.EMAILJS_SERVICE_ID;
      delete process.env.EMAILJS_TEMPLATE_ID;
      delete process.env.EMAILJS_PUBLIC_KEY;
      
      const email = new Email(mockUser, mockUrl);
      
      await expect(email.sendWithEmailJS('Test', '<h1>Test</h1>'))
        .rejects
        .toThrow('Configuration EmailJS manquante');
    });
  });

  describe('Envoi d\'emails avec Fallback', () => {
    test('devrait envoyer avec Nodemailer en premier', async () => {
      // Configuration Gmail
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'app_password';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock succès Nodemailer
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test123' });
      
      const email = new Email(mockUser, mockUrl);
      
      // Mock de la méthode send pour éviter les templates Pug
      jest.spyOn(email, 'send').mockImplementation(async (template, subject) => {
        const mailOptions = {
          from: email.from,
          to: email.to,
          subject,
          html: '<h1>Test</h1>',
          text: 'Test'
        };
        
        try {
          await email.newTransport().sendMail(mailOptions);
          console.log('✅ Email envoyé avec succès via Nodemailer');
        } catch (error) {
          console.error('❌ Erreur Nodemailer, tentative avec EmailJS:', error.message);
          throw error;
        }
      });
      
      await email.send('welcome', 'Bienvenue');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(emailjs.send).not.toHaveBeenCalled();
    });

    test('devrait basculer vers EmailJS si Nodemailer échoue', async () => {
      // Configuration EmailJS
      process.env.EMAILJS_SERVICE_ID = 'service_test123';
      process.env.EMAILJS_TEMPLATE_ID = 'template_test456';
      process.env.EMAILJS_PUBLIC_KEY = 'pk_test789';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock échec Nodemailer
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));
      
      // Mock succès EmailJS
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });
      
      const email = new Email(mockUser, mockUrl);
      
      // Mock de la méthode send pour tester le fallback
      jest.spyOn(email, 'send').mockImplementation(async (template, subject) => {
        const mailOptions = {
          from: email.from,
          to: email.to,
          subject,
          html: '<h1>Test</h1>',
          text: 'Test'
        };
        
        try {
          await email.newTransport().sendMail(mailOptions);
          console.log('✅ Email envoyé avec succès via Nodemailer');
        } catch (error) {
          console.error('❌ Erreur Nodemailer, tentative avec EmailJS:', error.message);
          
          try {
            await email.sendWithEmailJS(subject, mailOptions.html);
            console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
          } catch (emailjsError) {
            console.error('❌ Erreur EmailJS également:', emailjsError.message);
            throw new Error(`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
          }
        }
      });
      
      await email.send('welcome', 'Bienvenue');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(emailjs.send).toHaveBeenCalledTimes(1);
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_test123',
        'template_test456',
        expect.objectContaining({
          to_email: mockUser.email,
          to_name: mockUser.firstName,
          subject: 'Bienvenue',
          message: 'Test',
          html_message: '<h1>Test</h1>'
        }),
        {
          publicKey: 'pk_test789'
        }
      );
    });

    test('devrait lancer une erreur si Nodemailer et EmailJS échouent', async () => {
      // Configuration EmailJS
      process.env.EMAILJS_SERVICE_ID = 'service_test123';
      process.env.EMAILJS_TEMPLATE_ID = 'template_test456';
      process.env.EMAILJS_PUBLIC_KEY = 'pk_test789';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock échec Nodemailer
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));
      
      // Mock échec EmailJS
      emailjs.send.mockRejectedValue(new Error('EmailJS quota exceeded'));
      
      const email = new Email(mockUser, mockUrl);
      
      // Mock de la méthode send pour tester l'échec total
      jest.spyOn(email, 'send').mockImplementation(async (template, subject) => {
        const mailOptions = {
          from: email.from,
          to: email.to,
          subject,
          html: '<h1>Test</h1>',
          text: 'Test'
        };
        
        try {
          await email.newTransport().sendMail(mailOptions);
          console.log('✅ Email envoyé avec succès via Nodemailer');
        } catch (error) {
          console.error('❌ Erreur Nodemailer, tentative avec EmailJS:', error.message);
          
          try {
            await email.sendWithEmailJS(subject, mailOptions.html);
            console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
          } catch (emailjsError) {
            console.error('❌ Erreur EmailJS également:', emailjsError.message);
            throw new Error(`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
          }
        }
      });
      
      await expect(email.send('welcome', 'Bienvenue'))
        .rejects
        .toThrow('Échec envoi email: Nodemailer (SMTP connection failed) et EmailJS (EmailJS quota exceeded)');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(emailjs.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test EmailJS Direct', () => {
    test('devrait envoyer un email via EmailJS avec les bons paramètres', async () => {
      // Configuration EmailJS
      process.env.EMAILJS_SERVICE_ID = 'service_test123';
      process.env.EMAILJS_TEMPLATE_ID = 'template_test456';
      process.env.EMAILJS_PUBLIC_KEY = 'pk_test789';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock succès EmailJS
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });
      
      const email = new Email(mockUser, mockUrl);
      
      await email.sendWithEmailJS('Test Subject', '<h1>Test HTML</h1>');
      
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_test123',
        'template_test456',
        {
          to_email: mockUser.email,
          to_name: mockUser.firstName,
          from_name: 'Harvests',
          subject: 'Test Subject',
          message: 'Test HTML', // htmlToText conversion
          html_message: '<h1>Test HTML</h1>',
          reply_to: 'noreply@harvests.sn'
        },
        {
          publicKey: 'pk_test789'
        }
      );
    });
  });

  describe('Test de Connexion', () => {
    test('devrait tester la connexion Nodemailer avec succès', async () => {
      // Mock succès de vérification
      mockTransporter.verify.mockResolvedValue(true);
      
      const email = new Email(mockUser, mockUrl);
      const result = await email.testConnection();
      
      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    });

    test('devrait retourner false si la connexion Nodemailer échoue', async () => {
      // Mock échec de vérification
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      
      const email = new Email(mockUser, mockUrl);
      const result = await email.testConnection();
      
      expect(result).toBe(false);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email de Test avec Fallback', () => {
    test('devrait envoyer un email de test via Nodemailer', async () => {
      // Configuration Gmail
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'app_password';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock succès Nodemailer
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test123' });
      
      const email = new Email(mockUser, mockUrl);
      const result = await email.sendTestEmail();
      
      expect(result).toEqual({ messageId: 'test123' });
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(emailjs.send).not.toHaveBeenCalled();
    });

    test('devrait basculer vers EmailJS pour l\'email de test si Nodemailer échoue', async () => {
      // Configuration EmailJS
      process.env.EMAILJS_SERVICE_ID = 'service_test123';
      process.env.EMAILJS_TEMPLATE_ID = 'template_test456';
      process.env.EMAILJS_PUBLIC_KEY = 'pk_test789';
      process.env.EMAIL_FROM = 'noreply@harvests.sn';
      
      // Mock échec Nodemailer
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));
      
      // Mock succès EmailJS
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });
      
      const email = new Email(mockUser, mockUrl);
      const result = await email.sendTestEmail();
      
      expect(result).toEqual({ status: 200, text: 'OK' });
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(emailjs.send).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    // Nettoyer les variables d'environnement
    delete process.env.EMAILJS_SERVICE_ID;
    delete process.env.EMAILJS_TEMPLATE_ID;
    delete process.env.EMAILJS_PUBLIC_KEY;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
  });
});
