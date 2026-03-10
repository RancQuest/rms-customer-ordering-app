import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuCategories, getMenuItems } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import type { MenuCategory, MenuItem } from '@/types/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function MenuPage() {
  const { restaurantId, api } = useRestaurant();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const base = `/${restaurantSlug}`;

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuCategories(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as MenuCategory[];
    },
    enabled: !!restaurantId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuItems(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as MenuItem[];
    },
    enabled: !!restaurantId,
  });

  const isLoading = catLoading || itemsLoading;

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const id = item.menuCategoryId;
    if (!acc[id]) acc[id] = [];
    acc[id].push(item);
    return acc;
  }, {});

  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  if (isLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Typography variant="h5" fontWeight="bold" className="mb-4">
        Menu
      </Typography>
      {sortedCategories.length === 0 ? (
        <Alert severity="info">No menu categories yet.</Alert>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((category) => {
            const categoryItems = (byCategory[category.id] ?? []).sort(
              (a, b) => a.displayOrder - b.displayOrder
            );
            if (categoryItems.length === 0) return null;
            return (
              <section key={category.id}>
                <Typography variant="h6" color="primary" className="mb-2">
                  {category.name}
                </Typography>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryItems
                    .filter((i) => i.isActive)
                    .map((item) => (
                      <Link
                        key={item.id}
                        to={`${base}/item/${item.id}`}
                        className="no-underline"
                      >
                        <Card className="h-full transition shadow hover:shadow-md">
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="600">
                              {item.name}
                            </Typography>
                            {item.description && (
                              <Typography variant="body2" color="text.secondary" className="line-clamp-2 mt-1">
                                {item.description}
                              </Typography>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <Typography variant="body2" fontWeight="600">
                                {formatPrice(item.basePrice)}
                              </Typography>
                              {(item.variants?.length ?? 0) > 0 && (
                                <Chip size="small" label="Options" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
