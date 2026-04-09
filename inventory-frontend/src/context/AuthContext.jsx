import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth.api.js';

const AuthContext = createContext({
  user: null,
  token: null,
  memberships: [],
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    getMe()
      .then((res) => {
        setUser(res.data.user);
        setMemberships(res.data.memberships);
      })
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('activeShop');
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(newToken, newUser, newMemberships) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setMemberships(newMemberships);
  }

  function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('activeShop');
    setToken(null);
    setUser(null);
    setMemberships([]);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        memberships,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
