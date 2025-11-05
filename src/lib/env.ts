// Helper para extraer variables de entorno via import.meta.env (Vite)

const envAny = (import.meta as any).env || {};

export const API_URL: string = envAny.VITE_URL_API || 'http://localhost:1337';

// Para exponer claves al cliente en Vite deben empezar por VITE_
// Soportamos VITE_API_KEY; si no existe, intentamos API_KEY (puede ser undefined)
export const API_KEY: string | undefined = envAny.VITE_API_KEY || envAny.API_KEY || undefined;


