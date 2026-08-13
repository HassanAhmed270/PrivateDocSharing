import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../services/api.js';
import { getCurrentUser, loginUser } from '../services/auth.js';
import {
  clearSessionStorage,
  getStoredUser,
  storeSession,
} from '../utils/authStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getStoredAuthToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearSessionStorage();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function rehydrateSession() {
      const storedToken = getStoredAuthToken();

      if (!storedToken) {
        clearSessionStorage();
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          throw new Error('Missing user in session response');
        }

        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser);
          storeSession({ token: storedToken, user: currentUser });
        }
      } catch (error) {
        const shouldApiRedirect = error.response?.status === 401;

        clearSessionStorage();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }

        if (shouldApiRedirect && window.location.pathname !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    rehydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleAuthError(event) {
      if (event.detail?.status === 401) {
        clearSession();
      }
    }

    window.addEventListener('privateai:auth-error', handleAuthError);

    return () => {
      window.removeEventListener('privateai:auth-error', handleAuthError);
    };
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials);

    if (!session.token || !session.user) {
      throw new Error('Login response did not include a valid token and user.');
    }

    storeSession(session);
    setToken(session.token);
    setUser(session.user);

    return session.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [loading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
