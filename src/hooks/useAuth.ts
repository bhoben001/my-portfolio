import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, ADMIN_EMAIL } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!auth);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const isAdmin =
    !!user && !!ADMIN_EMAIL && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL;

  return { user, isAdmin, ready };
}
