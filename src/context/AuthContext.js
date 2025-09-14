import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ADMIN':
      return { 
        ...state, 
        admin: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { 
        ...state, 
        admin: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null 
      };
    default:
      return state;
  }
};

const initialState = {
  admin: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');

        if (token && adminData) {
          try {
            // Verify token is still valid
            const response = await authAPI.getMe();
            dispatch({ type: 'SET_ADMIN', payload: response.data.admin });
          } catch (error) {
            console.warn('Token verification failed:', error.message);
            // Token is invalid, remove it
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            dispatch({ type: 'SET_ADMIN', payload: null });
          }
        } else {
          dispatch({ type: 'SET_ADMIN', payload: null });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'SET_ADMIN', payload: null });
      }
    };

    checkAuthStatus();
  }, []);

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authAPI.signup(userData);
      const { admin, token } = response.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));

      dispatch({ type: 'SET_ADMIN', payload: admin });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        const { admin, token } = response.data;

        if (!admin || !token) {
          throw new Error('Invalid response: missing admin or token');
        }

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));

        dispatch({ type: 'SET_ADMIN', payload: admin });
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An error occurred during login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    signup,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
