import api from './api';

export const contactService = {
  /**
   * Envoyer un message de contact
   * @param {Object} data - Données du formulaire de contact
   * @param {string} data.name - Nom complet
   * @param {string} data.email - Email
   * @param {string} data.subject - Sujet
   * @param {string} data.message - Message
   * @param {string} data.type - Type de demande (general, support, partnership, complaint, suggestion)
   * @returns {Promise<Object>}
   */
  sendMessage: async (data) => {
    try {
      const response = await api.post('/contact', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default contactService;

