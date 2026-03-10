import { publicApi } from './client';
import type { Restaurant } from '@/types/api';

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, status } = await publicApi.get<Restaurant>(`/api/restaurants/by-slug/${encodeURIComponent(slug)}`);
  if (status === 404) return null;
  return data;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, status } = await publicApi.get<Restaurant>(`/api/restaurants/${id}`);
  if (status === 404) return null;
  return data;
}
