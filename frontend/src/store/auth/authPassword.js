// Fonctions de gestion des mots de passe

import { authService } from '../../services';

export const verifyEmail = async (token) => {
  try {
    const response = await authService.verifyEmail(token);
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de vérification';
    return { success: false, error: errorMessage };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await authService.forgotPassword(email);
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur d\'envoi d\'email';
    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await authService.resetPassword(token, password);
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de réinitialisation';
    return { success: false, error: errorMessage };
  }
};

export const updatePassword = async (passwords) => {
  try {
    const response = await authService.updatePassword(passwords);
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de changement de mot de passe';
    return { success: false, error: errorMessage };
  }
};

