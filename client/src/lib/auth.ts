import { User } from "@shared/schema";

let currentUser: User | null = null;
let authInitialized = false;

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

export function isAuthInitialized(): boolean {
  return authInitialized;
}

export async function initializeAuth(): Promise<User | null> {
  const stored = localStorage.getItem('currentUser');
  if (!stored) {
    authInitialized = true;
    return null;
  }
  
  try {
    const storedUser = JSON.parse(stored);
    currentUser = storedUser;
    
    // Try to validate session with backend (best-effort)
    try {
      console.log('[App] Validating session with backend...');
      const response = await fetch(`/api/auth/me?userId=${storedUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        console.log('[App] Session validated successfully:', currentUser?.username || 'Unknown');
      } else if (response.status === 401) {
        // User no longer exists in database - clear session
        console.warn('[App] User not found in database, clearing session');
        localStorage.removeItem('currentUser');
        currentUser = null;
      } else {
        // Other errors - keep local session but log warning
        console.warn('[App] Session validation failed, using cached session');
      }
    } catch (fetchError) {
      // Network error or server down - keep using localStorage
      console.warn('[App] Cannot reach server, using cached session:', fetchError);
    }
    
    authInitialized = true;
    return currentUser;
  } catch (error) {
    // localStorage parse error - clear it
    console.error('[App] Invalid session data, clearing:', error);
    localStorage.removeItem('currentUser');
    currentUser = null;
    authInitialized = true;
    return null;
  }
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
