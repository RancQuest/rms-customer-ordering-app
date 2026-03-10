import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenus, getMenuCategories } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export function Breadcrumbs() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchParams] = useSearchParams();
  const menuId = searchParams.get('menu');
  const categoryId = searchParams.get('category');
  const base = `/${restaurantSlug}`;
  const { restaurantId, api } = useRestaurant();

  const { data: menusResult } = useQuery({
    queryKey: ['menus', restaurantId],
    queryFn: async () => {
      const { data } = await getMenus(api, restaurantId!);
      return data;
    },
    enabled: !!restaurantId && !!(menuId || categoryId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuCategories(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as { id: string; name: string }[];
    },
    enabled: !!restaurantId && !!categoryId,
  });

  const menus = menusResult?.items ?? [];
  const menu = menuId ? menus.find((m) => m.id === menuId) : null;
  const category = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;

  if (!menuId && !categoryId) return null;

  return (
    <div className="border-b border-orange-100 bg-white px-4">
      <nav
        className="flex flex-wrap items-center gap-1 py-3 text-sm text-gray-600"
        aria-label="Breadcrumb"
      >
      <Link
        to={base}
        className="text-orange-600 no-underline hover:underline hover:text-orange-700"
      >
        Menus
      </Link>
      {menu && (
        <>
          <NavigateNextIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
          {categoryId ? (
            <Link
              to={`${base}?menu=${menu.id}`}
              className="text-orange-600 no-underline hover:underline hover:text-orange-700"
            >
              {menu.name}
            </Link>
          ) : (
            <Typography component="span" variant="body2" color="text.primary">
              {menu.name}
            </Typography>
          )}
        </>
      )}
      {category && (
        <>
          <NavigateNextIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
          <Typography component="span" variant="body2" color="text.primary" fontWeight="500">
            {category.name}
          </Typography>
        </>
      )}
      </nav>
    </div>
  );
}
