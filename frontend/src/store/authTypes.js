// Types et constantes pour l'authentification

// État initial
export const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Commencer à true pour attendre la restauration de session
  error: null,
  lastActivity: null,
  tokenExpiry: null,
};

// Actions
export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESTORE_SESSION: 'RESTORE_SESSION',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SET_TOKEN_EXPIRY: 'SET_TOKEN_EXPIRY',
};
