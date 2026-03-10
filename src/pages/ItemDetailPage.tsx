import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMenuItemById } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import { useCartStore } from '@/store/cartStore';
import {
  Card,
  CardContent,
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
} from '@mui/material';
import type { MenuItem, Modifier, Variant } from '@/types/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
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
    navigate(`/${restaurantSlug}/cart`);
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
        <CircularProgress />
      </Box>
    );
  }
  if (isError || !item) {
    return (
      <div className="p-4">
        <Alert severity="error">Item not found.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Card className="overflow-hidden">
        <CardContent className="space-y-4">
          <Typography variant="h5" fontWeight="bold">
            {item.name}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          )}
          <Typography variant="body1" fontWeight="600">
            {formatPrice(item.basePrice)}
          </Typography>

          {Object.keys(variantGroups).length > 0 && (
            <>
              <FormControl component="fieldset">
                <FormLabel>Size / Option</FormLabel>
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
                      control={<Radio />}
                      label={`${v.name} ${v.priceDelta !== 0 ? formatPrice(v.priceDelta) : ''}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </>
          )}

          {Object.keys(modifierGroups).length > 0 && (
            <>
              <FormLabel>Add-ons</FormLabel>
              {Object.entries(modifierGroups).map(([, mods]) =>
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
                      />
                    }
                    label={`${m.name} ${m.priceDelta !== 0 ? formatPrice(m.priceDelta) : ''}`}
                  />
                ))
              )}
            </>
          )}

          <TextField
            fullWidth
            size="small"
            label="Special instructions"
            placeholder="e.g. No onions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="mt-2"
          />
          <Box className="flex items-center gap-2">
            <Typography>Quantity:</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </Button>
            <Typography fontWeight="bold">{quantity}</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </Button>
          </Box>

          <Typography variant="h6">Total: {formatPrice(totalPrice)}</Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
