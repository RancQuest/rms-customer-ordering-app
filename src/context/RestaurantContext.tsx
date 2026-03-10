import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantBySlug } from '@/api/restaurant';
import { createApiClient } from '@/api/client';
import type { Restaurant } from '@/types/api';

interface RestaurantContextValue {
  slug: string;
  restaurant: Restaurant | undefined;
  restaurantId: string | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  api: ReturnType<typeof createApiClient>;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const {
    data: restaurantData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => getRestaurantBySlug(slug),
    enabled: !!slug,
  });
  const restaurant = restaurantData ?? undefined;

  const api = useMemo(
    () => createApiClient(restaurant?.id ?? null),
    [restaurant?.id]
  );

  const value = useMemo<RestaurantContextValue>(
    () => ({
      slug,
      restaurant,
      restaurantId: restaurant?.id ?? null,
      isLoading,
      isError,
      error: error ?? null,
      refetch,
      api,
    }),
    [slug, restaurant, isLoading, isError, error, refetch, api]
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
