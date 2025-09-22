// Puedes poner esto en un archivo como src/services/authService.ts

export async function registerUser({ username, email, password }: { username: string, email: string, password: string }) {
  const res = await fetch('http://localhost:1337/api/auth/local/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Error en el registro');
  }

  return await res.json(); // Devuelve { jwt, user }
}