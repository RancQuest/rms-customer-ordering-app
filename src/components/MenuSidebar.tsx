import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenus, getMenuCategories } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import type { Menu, MenuCategory, MenuCategoryMenu } from '@/types/api';
import {
  LunchDining,
  LocalCafe,
  Cake,
  SetMeal,
  BakeryDining,
  RamenDining,
  MenuBook,
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

function getCategoryName(
  link: MenuCategoryMenu,
  allCategories: MenuCategory[]
): string {
  if (link.categoryName) return link.categoryName;
  const cat = allCategories.find((c) => c.id === link.menuCategoryId);
  return cat?.name ?? 'Category';
}

export function MenuSidebar() {
  const { restaurantSlug, menuId: selectedMenuId, categoryId: selectedCategoryId } = useParams<{
    restaurantSlug: string;
    menuId?: string;
    categoryId?: string;
  }>();
  const base = `/${restaurantSlug}`;
  const { restaurantId, api, restaurant } = useRestaurant();

  const { data: menusResult } = useQuery({
    queryKey: ['menus', restaurantId],
    queryFn: async () => {
      const { data } = await getMenus(api, restaurantId!);
      return data;
    },
    enabled: !!restaurantId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuCategories(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as MenuCategory[];
    },
    enabled: !!restaurantId,
  });

  const menus: Menu[] = menusResult?.items ?? [];
  const sortedMenus = [...menus].sort((a, b) => a.name.localeCompare(b.name));

  const allSelected = !selectedMenuId && !selectedCategoryId;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-[#faf8f5]">
      <Link
        to={base}
        className="flex items-center gap-3 border-b border-gray-200 px-5 py-5 no-underline text-inherit transition-colors hover:bg-white/60"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <LunchDining sx={{ fontSize: 24 }} />
        </div>
        <span className="truncate text-lg font-semibold tracking-tight text-gray-900">
          {restaurant?.name ?? 'Cafe'}
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0 overflow-y-auto px-3 py-4" aria-label="Menu navigation">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Menus
        </p>

        <Link
          to={base}
          className={`mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left no-underline transition-colors ${
            allSelected
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-orange-50'
          }`}
        >
          <MenuBook
            sx={{ fontSize: 20 }}
            className={allSelected ? 'text-white' : 'text-orange-600'}
          />
          <span className="font-medium">All</span>
        </Link>

        {sortedMenus.map((menu) => {
          const links = (menu.categoryLinks ?? []).filter((l) => l.isEnabled);
          const sortedLinks = [...links].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );
          const categoriesToShow =
            sortedLinks.length > 0
              ? sortedLinks.map((l) => ({
                  id: l.menuCategoryId,
                  name: getCategoryName(l, categories),
                }))
              : categories
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((c) => ({ id: c.id, name: c.name }));

          const isMenuSelected = selectedMenuId === menu.id;

          return (
            <section key={menu.id} className="mb-5">
              <Link
                to={`${base}/menu/${menu.id}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left no-underline transition-colors ${
                  isMenuSelected && !selectedCategoryId
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-800 hover:bg-orange-50'
                }`}
              >
                <MenuBook
                  sx={{ fontSize: 20 }}
                  className={
                    isMenuSelected && !selectedCategoryId
                      ? 'text-white'
                      : 'text-orange-600'
                  }
                />
                <span className="font-medium">{menu.name}</span>
              </Link>

              {categoriesToShow.length > 0 && (
                <ul className="mt-1.5 list-none border-l-2 border-orange-200 pl-2" role="list">
                  {categoriesToShow.map((cat, index) => {
                    const Icon = getCategoryIcon(index);
                    const isCategorySelected =
                      selectedCategoryId === cat.id &&
                      selectedMenuId === menu.id;
                    const href = `${base}/menu/${menu.id}/category/${cat.id}`;
                    return (
                      <li key={cat.id} className="mb-0.5">
                        <Link
                          to={href}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm no-underline transition-colors ${
                            isCategorySelected
                              ? 'bg-orange-500 font-medium text-white shadow-sm'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon
                            sx={{ fontSize: 18 }}
                            className={
                              isCategorySelected ? 'text-white' : 'text-orange-500'
                            }
                          />
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
