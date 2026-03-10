import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuItemById } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import { useCartStore } from '@/store/cartStore';
import {
  Typography,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { MenuItem, Modifier, Variant } from '@/types/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function ItemDetailPage() {
  const { itemId, restaurantSlug } = useParams<{ itemId: string; restaurantSlug: string }>();
  const navigate = useNavigate();
  const base = `/${restaurantSlug}`;
  const { restaurantId, api } = useRestaurant();
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: async () => {
      const { data } = await getMenuItemById(api, itemId!);
      return data as MenuItem;
    },
    enabled: !!itemId && !!restaurantId,
  });

  const handleAddToCart = () => {
    if (!item || !restaurantId) return;
    addItem(restaurantId, {
      menuItem: item,
      quantity,
      selectedModifiers,
      selectedVariants,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    navigate(`${base}/cart`);
  };

  const variantGroups = (item?.variants ?? []).reduce<Record<string, Variant[]>>((acc, v) => {
    const gid = v.variantGroupId;
    if (!acc[gid]) acc[gid] = [];
    acc[gid].push(v);
    return acc;
  }, {});

  const modifierGroups = (item?.modifiers ?? []).reduce<Record<string, Modifier[]>>((acc, m) => {
    const gid = m.modifierGroupId;
    if (!acc[gid]) acc[gid] = [];
    acc[gid].push(m);
    return acc;
  }, {});

  const totalPrice =
    (item?.basePrice ?? 0) * quantity +
    selectedVariants.reduce((s, v) => s + v.priceDelta * quantity, 0) +
    selectedModifiers.reduce((s, m) => s + m.priceDelta * quantity, 0);

  if (isLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }
  if (isError || !item) {
    return (
      <div className="p-4">
        <Alert severity="error">Item not found.</Alert>
        <Button component={Link} to={base} sx={{ mt: 2 }}>
          Back to menu
        </Button>
      </div>
    );
  }

  const imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-orange-100">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <Typography variant="h5" fontWeight="bold" color="text.primary" className="mb-1">
              {item.name}
            </Typography>
            <div className="mb-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} sx={{ fontSize: 18, color: '#f59e0b' }} />
              ))}
            </div>
            <div className="mb-4 flex items-baseline gap-2">
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#ea580c' }}>
                {formatPrice(item.basePrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {formatPrice(item.basePrice * 1.2)}
              </Typography>
            </div>

            {item.description && (
              <Box className="mb-4">
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary" className="mb-1">
                  About Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            )}

            {Object.keys(variantGroups).length > 0 && (
              <FormControl component="fieldset" className="mb-4">
                <FormLabel component="legend">Size / Option</FormLabel>
                <RadioGroup
                  value={selectedVariants[0]?.id ?? ''}
                  onChange={(_, value) => {
                    const v = (item.variants ?? []).find((x) => x.id === value);
                    setSelectedVariants(v ? [v] : []);
                  }}
                >
                  {(item.variants ?? []).map((v) => (
                    <FormControlLabel
                      key={v.id}
                      value={v.id}
                      control={<Radio sx={{ color: '#ea580c', '&.Mui-checked': { color: '#ea580c' } }} />}
                      label={`${v.name} ${v.priceDelta !== 0 ? formatPrice(v.priceDelta) : ''}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {Object.keys(modifierGroups).length > 0 && (
              <Box className="mb-4">
                <FormLabel>Add-ons</FormLabel>
                <Box className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(modifierGroups).flatMap(([, mods]) =>
                    mods.map((m) => (
                      <FormControlLabel
                        key={m.id}
                        control={
                          <Checkbox
                            checked={selectedModifiers.some((x) => x.id === m.id)}
                            onChange={(_, checked) => {
                              setSelectedModifiers((prev) =>
                                checked ? [...prev, m] : prev.filter((x) => x.id !== m.id)
                              );
                            }}
                            sx={{ color: '#ea580c', '&.Mui-checked': { color: '#ea580c' } }}
                          />
                        }
                        label={`${m.name} ${m.priceDelta !== 0 ? formatPrice(m.priceDelta) : ''}`}
                      />
                    ))
                  )}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              size="small"
              label="Special instructions"
              placeholder="e.g. No onions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-0 rounded-full border border-orange-200 bg-orange-50/50">
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  sx={{ color: '#ea580c' }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <span className="min-w-[2rem] text-center font-medium">{quantity}</span>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                  sx={{ color: '#ea580c' }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </div>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                startIcon={<AddIcon />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#ea580c',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': { backgroundColor: '#c2410c' },
                }}
              >
                Add to cart
              </Button>
            </div>
            <Typography variant="h6" fontWeight="bold" className="mt-3">
              Total: {formatPrice(totalPrice)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
