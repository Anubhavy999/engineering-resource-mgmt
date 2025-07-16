const TOKEN_KEY  = 'token';
const ROLE_KEY   = 'role';
const EMAIL_KEY  = 'email';
const subscribers = new Set();

// Getters
export function getToken()    { return sessionStorage.getItem(TOKEN_KEY); }
export function getRole()     { return sessionStorage.getItem(ROLE_KEY); }
export const  getUserRole    = getRole;
export function getEmail()    { return sessionStorage.getItem(EMAIL_KEY); }

// Set
export function setSession({ token, role, email }) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (role)  sessionStorage.setItem(ROLE_KEY, role);
  if (email) sessionStorage.setItem(EMAIL_KEY, email);
}

// Clear
export function clearSession() { sessionStorage.clear(); }

// Pub/Sub for role changes (multi‑tab sync)
export function onRoleChange(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
export function emitRoleChange(newRole) {
  sessionStorage.setItem(ROLE_KEY, newRole);
  localStorage.setItem(ROLE_KEY, newRole);
  subscribers.forEach((fn) => fn(newRole));
}
