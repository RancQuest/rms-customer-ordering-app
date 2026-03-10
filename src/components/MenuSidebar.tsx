import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuCategories } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import type { MenuCategory } from '@/types/api';
import {
  LunchDining,
  LocalCafe,
  Cake,
  SetMeal,
  BakeryDining,
  RamenDining,
} from '@mui/icons-material';

const CATEGORY_ICONS = [
  LunchDining,
  SetMeal,
  RamenDining,
  BakeryDining,
  Cake,
  LocalCafe,
];

function getCategoryIcon(index: number) {
  return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
}

export function MenuSidebar() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('category');
  const base = `/${restaurantSlug}`;
  const { restaurantId, api, restaurant } = useRestaurant();

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuCategories(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as MenuCategory[];
    },
    enabled: !!restaurantId,
  });

  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const allSelected = !selectedId;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-orange-100 bg-[#faf8f5]">
      <Link
        to={base}
        className="flex items-center gap-2 px-5 py-6 no-underline text-inherit"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <LunchDining sx={{ fontSize: 24 }} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          {restaurant?.name ?? 'Cafe'}
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Menu Categories
        </div>
        <Link
          to={base}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left no-underline transition-colors ${
            allSelected ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50'
          }`}
        >
          <LunchDining
            sx={{ fontSize: 22 }}
            className={allSelected ? 'text-white' : 'text-orange-600'}
          />
          <span className="font-medium">All</span>
        </Link>
        {sortedCategories.map((cat, index) => {
          const Icon = getCategoryIcon(index);
          const isSelected = selectedId === cat.id;
          const href = `${base}?category=${cat.id}`;
          return (
            <Link
              key={cat.id}
              to={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left no-underline transition-colors ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-orange-50'
              }`}
            >
              <Icon
                sx={{ fontSize: 22 }}
                className={isSelected ? 'text-white' : 'text-orange-600'}
              />
              <span className="font-medium">{cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
