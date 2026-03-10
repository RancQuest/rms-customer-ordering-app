import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function createApiClient(restaurantId: string | null) {
  const client = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...(restaurantId ? { 'x-restaurant-id': restaurantId } : {}),
    },
  });
  return client;
}

export const publicApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
