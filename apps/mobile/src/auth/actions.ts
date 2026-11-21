import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOutRaw,
  updatePassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';

import { ApiError } from '@/api/client';
import { firebaseErrorCode, firebaseErrorMessage } from '@/lib/firebaseErrors';
import { getFirebaseAuth } from '@/lib/firebase';

/** Wraps a Firebase failure in the ApiError shape the screens already display. */
function toApiError(error: unknown, fallback: string): ApiError {
  return new ApiError(firebaseErrorMessage(error, fallback), firebaseErrorCode(error), 400);
}

function requireUser(): FirebaseUser {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new ApiError('You are signed out. Please sign in again.', 'auth/no-current-user', 401);
  return user;
}

export async function firebaseSignIn(email: string, password: string): Promise<FirebaseUser> {
  try {
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    return credential.user;
  } catch (error) {
    throw toApiError(error, 'Sign-in failed. Please try again.');
  }
}

/**
 * Creates the Firebase account, sets the display name and sends the verification email. The session provider then
 * links the account to its SI Coin account and mirrors the profile to Firestore (so the website sees it). Only the
 * account creation itself can fail the call; the rest is best-effort.
 */
export async function firebaseRegister(input: { name: string; email: string; password: string }): Promise<FirebaseUser> {
  let user: FirebaseUser;
  try {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email.trim(), input.password);
    user = credential.user;
  } catch (error) {
    throw toApiError(error, 'We could not create your account. Please try again.');
  }

  try {
    await updateProfile(user, { displayName: input.name.trim() });
    // The ID token issued at sign-up predates the name. Refresh it so the API (which reads the "name" claim when it
    // creates the SI Coin account) and the Firestore profile get the real name instead of the email prefix.
    await user.getIdToken(true);
  } catch {
    // Not fatal: the name can still be edited from Account > Edit profile.
  }
  void sendEmailVerification(user).catch(() => undefined);
  return user;
}

/** Sends a reset link. Callers should show the same message whether or not the address has an account. */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (error) {
    const code = firebaseErrorCode(error);
    // Do not reveal whether an address is registered.
    if (code === 'auth/user-not-found') return;
    throw toApiError(error, 'We could not send the reset email. Please try again.');
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const user = requireUser();
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw toApiError(error, 'We could not send the verification email. Please try again in a moment.');
  }
}

/** Re-reads the account from Firebase and refreshes its ID token (picks up a clicked verification link). */
export async function reloadFirebaseUser(): Promise<FirebaseUser> {
  const user = requireUser();
  try {
    await user.reload();
    await user.getIdToken(true);
  } catch (error) {
    throw toApiError(error, 'We could not refresh your account. Check your connection and try again.');
  }
  return getFirebaseAuth().currentUser ?? user;
}

/** Confirms the current password, then sets the new one. */
export async function changeFirebasePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = requireUser();
  if (!user.email) throw new ApiError('This account has no email address.', 'auth/no-email', 400);
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
  } catch (error) {
    const code = firebaseErrorCode(error);
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      throw new ApiError('Your current password is incorrect.', code, 400);
    }
    throw toApiError(error, 'We could not confirm your current password. Please try again.');
  }
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    throw toApiError(error, 'We could not change your password. Please try again.');
  }
}

export async function updateFirebaseDisplayName(name: string): Promise<void> {
  const user = requireUser();
  try {
    await updateProfile(user, { displayName: name.trim() });
  } catch (error) {
    throw toApiError(error, 'We could not update your name. Please try again.');
  }
}

export async function firebaseSignOut(): Promise<void> {
  try {
    await firebaseSignOutRaw(getFirebaseAuth());
  } catch {
    // Already signed out, or Firebase is not configured: the local session is cleared by the caller regardless.
  }
}
