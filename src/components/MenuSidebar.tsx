import { Link, useParams, useSearchParams } from 'react-router-dom';
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
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useState } from 'react';

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
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchParams] = useSearchParams();
  const selectedMenuId = searchParams.get('menu');
  const selectedCategoryId = searchParams.get('category');
  const base = `/${restaurantSlug}`;
  const { restaurantId, api, restaurant } = useRestaurant();
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(() =>
    selectedMenuId ? new Set([selectedMenuId]) : new Set()
  );

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

  const toggleMenu = (menuId: string) => {
    setExpandedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const allSelected = !selectedMenuId && !selectedCategoryId;

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
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Menus
        </div>
        <Link
          to={base}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left no-underline transition-colors ${
            allSelected
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-orange-50'
          }`}
        >
          <MenuBook
            sx={{ fontSize: 22 }}
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
          const isExpanded =
            expandedMenuIds.has(menu.id) ||
            isMenuSelected ||
            (selectedCategoryId &&
              categoriesToShow.some((c) => c.id === selectedCategoryId));

          return (
            <div key={menu.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-0">
                <Link
                  to={`${base}?menu=${menu.id}`}
                  className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left no-underline transition-colors ${
                    isMenuSelected && !selectedCategoryId
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <MenuBook
                    sx={{ fontSize: 22 }}
                    className={
                      isMenuSelected && !selectedCategoryId
                        ? 'text-white'
                        : 'text-orange-600'
                    }
                  />
                  <span className="flex-1 font-medium">{menu.name}</span>
                </Link>
                {categoriesToShow.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleMenu(menu.id)}
                    className="rounded p-1 text-gray-500 hover:bg-orange-100 hover:text-orange-700"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ExpandLess sx={{ fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: 20 }} />
                    )}
                  </button>
                )}
              </div>
              {isExpanded &&
                categoriesToShow.map((cat, index) => {
                  const Icon = getCategoryIcon(index);
                  const isCategorySelected =
                    selectedCategoryId === cat.id &&
                    selectedMenuId === menu.id;
                  const href = `${base}?menu=${menu.id}&category=${cat.id}`;
                  return (
                    <Link
                      key={cat.id}
                      to={href}
                      className={`ml-6 flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm no-underline transition-colors ${
                        isCategorySelected
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      <Icon
                        sx={{ fontSize: 20 }}
                        className={
                          isCategorySelected ? 'text-white' : 'text-orange-600'
                        }
                      />
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
