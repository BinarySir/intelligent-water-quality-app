import {
  signInAnonymously,
  type User,
} from 'firebase/auth';

import { auth } from './firebase';

export async function ensureAnonymousUser(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);

  return result.user;
}