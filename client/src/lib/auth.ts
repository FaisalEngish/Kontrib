import { User } from "@shared/schema";

let currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setCurrentUser(user: User | null): void {
  currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
  
  // Trigger a custom event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
}

export function initializeAuth(): User | null {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
  }
  return currentUser;
}

export function isAdmin(): boolean {
  return currentUser?.role === 'admin';
}

export function isMember(): boolean {
  return currentUser?.role === 'member';
}

export function logout(): void {
  setCurrentUser(null);
}
