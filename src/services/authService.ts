import { API_URL, API_KEY } from '../lib/env';

export async function registerUser({ username, email, password }: { username: string, email: string, password: string }) {
  const res = await fetch(`${API_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}) },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Error en el registro');
  }

  return await res.json(); // Devuelve { jwt, user }
}