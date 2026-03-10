import { useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuCategories, getMenuItems } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  CircularProgress,
  Box,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCartStore } from '@/store/cartStore';
import type { MenuCategory, MenuItem } from '@/types/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function MenuItemCard({
  item,
  basePath,
  onQuickAdd,
}: {
  item: MenuItem;
  basePath: string;
  onQuickAdd: (item: MenuItem, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const imageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80`;
  const hasVariants = (item.variants?.length ?? 0) > 0 || (item.modifiers?.length ?? 0) > 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100 transition hover:shadow-md">
      <Link to={`${basePath}/item/${item.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon
                key={i}
                sx={{ fontSize: 16, color: i <= 4 ? '#f59e0b' : '#e5e7eb' }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-orange-600">
              {formatPrice(item.basePrice)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(item.basePrice * 1.2)}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-orange-50 px-4 py-3">
        <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/50">
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              setQty((p) => Math.max(1, p - 1));
            }}
            sx={{ color: '#ea580c', '&:hover': { bg: 'rgba(249,115,22,0.1)' } }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <span className="min-w-[1.25rem] text-center text-sm font-medium text-gray-800">
            {qty}
          </span>
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              setQty((p) => p + 1);
            }}
            sx={{ color: '#ea580c', '&:hover': { bg: 'rgba(249,115,22,0.1)' } }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </div>
        <Link
          to={hasVariants ? `${basePath}/item/${item.id}` : basePath}
          className="no-underline"
          onClick={(e) => {
            if (!hasVariants) {
              e.preventDefault();
              onQuickAdd(item, qty);
            }
          }}
        >
          <span className="rounded-xl bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
            Add to cart
          </span>
        </Link>
      </div>
    </div>
  );
}

export function MenuPage() {
  const { restaurantId, api } = useRestaurant();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchParams] = useSearchParams();
  const selectedMenuId = searchParams.get('menu');
  const selectedCategoryId = searchParams.get('category');
  const [search, setSearch] = useState('');
  const base = `/${restaurantSlug}`;
  const addItem = useCartStore((s) => s.addItem);

  const { isLoading: catLoading } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await getMenuCategories(api, restaurantId!);
      return (Array.isArray(data) ? data : []) as MenuCategory[];
    },
    enabled: !!restaurantId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', restaurantId, selectedMenuId ?? undefined, selectedCategoryId ?? undefined],
    queryFn: async () => {
      const { data } = await getMenuItems(api, restaurantId!, {
        menuId: selectedMenuId ?? undefined,
        menuCategoryId: selectedCategoryId ?? undefined,
      });
      return (Array.isArray(data) ? data : []) as MenuItem[];
    },
    enabled: !!restaurantId,
  });

  const filteredItems = useMemo(() => {
    let list = items.filter((i) => i.isActive);
    if (selectedCategoryId) {
      list = list.filter((i) => i.menuCategoryId === selectedCategoryId);
    }
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, selectedCategoryId, search]);

  const isLoading = catLoading || itemsLoading;

  const handleQuickAdd = (item: MenuItem, qty: number) => {
    if (!restaurantId) return;
    addItem(restaurantId, {
      menuItem: item,
      quantity: qty,
      selectedModifiers: [],
      selectedVariants: [],
    });
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TextField
          placeholder="Search by food name..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              backgroundColor: '#faf8f5',
              '& fieldset': { borderColor: '#ffedd5' },
            },
          }}
          sx={{ minWidth: 280 }}
        />
        <IconButton
          sx={{
            border: '1px solid #ffedd5',
            borderRadius: 2,
            color: '#6b7280',
            '&:hover': { backgroundColor: '#fff7ed' },
          }}
        >
          <FilterListIcon />
        </IconButton>
      </div>

      <h2 className="mb-6 text-xl font-bold text-gray-800">
        {filteredItems.length} Delicious Food Menu
      </h2>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-orange-50 py-12 text-center text-gray-600">
          No items in this category. Try another or search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              basePath={base}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
