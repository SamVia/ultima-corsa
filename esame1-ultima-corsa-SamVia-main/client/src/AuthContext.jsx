import React, { createContext, useState, useEffect, useContext } from 'react';
import API from './API';

// Creazione del contesto
const AuthContext = createContext();

// Provider che avvolgerà l'applicazione
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Controllo iniziale della sessione all'avvio dell'app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(userInfo);
        setLoggedIn(true);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Funzione per il login
  const login = async (credentials) => {
    const userData = await API.logIn(credentials);
    setUser(userData);
    setLoggedIn(true);
  };

  // Funzione per il logout
  const logout = async () => {
    await API.logOut();
    setUser(null);
    setLoggedIn(false);
  };

  // Esponiamo anche setUser per aggiornare i punti dopo una partita
  const value = {
    user,
    loggedIn,
    loading,
    login,
    logout,
    setUser 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizzato per consumare il contesto facilmente
export const useAuth = () => {
  return useContext(AuthContext);
};