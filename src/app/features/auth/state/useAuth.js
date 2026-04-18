import { useCallback, useEffect, useState } from 'react';
import { getToken, setToken, clearToken } from '../../../shared/lib/storeage'; 

export function useAuth() {
  const [isBooting, setIsBooting] = useState(true);
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setTokenState(t);

      if (t) setUser({ id: 1, name: 'User', isLeader: false });
      setIsBooting(false);
    })();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const fakeToken = 'demo-token';
    await setToken(fakeToken);
    setTokenState(fakeToken);
    setUser({ id: 1, name: email, isLeader: false });
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return {
    isBooting,
    isAuthed: !!token,
    token,
    user,
    setUser,
    login,
    logout,
  };
}