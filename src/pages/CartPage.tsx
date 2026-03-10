import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCartStore } from '@/store/cartStore';
import { useRestaurant } from '@/context/RestaurantContext';
import { createOrder } from '@/api/orders';
import type { CreateOrderDto } from '@/types/order';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function lineTotal(line: {
  menuItem: { basePrice: number };
  quantity: number;
  selectedModifiers: { priceDelta: number }[];
  selectedVariants: { priceDelta: number }[];
}) {
  const base = line.menuItem.basePrice * line.quantity;
  const mods = line.selectedModifiers.reduce((s, m) => s + m.priceDelta * line.quantity, 0);
  const vars = line.selectedVariants.reduce((s, v) => s + v.priceDelta * line.quantity, 0);
  return base + mods + vars;
}

export function CartPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const base = `/${restaurantSlug}`;
  const { restaurant, restaurantId } = useRestaurant();
  const { lines, updateQuantity, removeLine, totalPrice, totalItems, clearCart } = useCartStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!restaurant?.id || !restaurant?.tenantId || !restaurantId) {
      setCheckoutError('Restaurant information is missing.');
      return;
    }
    setCheckoutError(null);
    setCheckingOut(true);
    try {
      const order: CreateOrderDto = {
        tenantId: restaurant.tenantId,
        restaurantId: restaurant.id,
        items: lines.map((line) => ({
          menuItemId: line.menuItem.id,
          menuItemName: line.menuItem.name,
          basePrice: line.menuItem.basePrice,
          quantity: line.quantity,
          selectedVariants: line.selectedVariants.map((v) => ({
            variantId: v.id,
            variantName: v.name,
            priceDelta: v.priceDelta,
          })),
          selectedModifiers: line.selectedModifiers.map((m) => ({
            modifierId: m.id,
            modifierName: m.name,
            priceDelta: m.priceDelta,
          })),
          specialInstructions: line.specialInstructions,
          taxRate: 0,
        })),
      };
      const response = await createOrder({ order });
      clearCart();
      window.location.href = `${base}?orderPlaced=${response.id}`;
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string }; status?: number } }).response?.data?.message
          ?? `Request failed (${(err as { response?: { status?: number } }).response?.status ?? 'error'})`
        : err instanceof Error
          ? err.message
          : 'Checkout failed. Please try again.';
      setCheckoutError(message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (totalItems() === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: '#d1d5db' }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          Your cart is empty
        </Typography>
        <Button
          component={Link}
          to={base}
          variant="contained"
          className="mt-6 rounded-xl px-6 py-2"
          sx={{
            backgroundColor: '#ea580c',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#c2410c' },
          }}
        >
          Browse menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Typography variant="h5" fontWeight="bold" className="mb-6 text-gray-800">
        Your order
      </Typography>
      {checkoutError && (
        <Alert severity="error" onClose={() => setCheckoutError(null)} sx={{ mb: 2 }}>
          {checkoutError}
        </Alert>
      )}
      <div className="space-y-4">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <Typography variant="subtitle1" fontWeight="600">
                {line.menuItem.name}
              </Typography>
              {(line.selectedVariants.length > 0 || line.selectedModifiers.length > 0) && (
                <Typography variant="caption" color="text.secondary">
                  {[
                    ...line.selectedVariants.map((v) => v.name),
                    ...line.selectedModifiers.map((m) => m.name),
                  ].join(', ')}
                </Typography>
              )}
              <Typography variant="body2" fontWeight="600" sx={{ color: '#ea580c', mt: 0.5 }}>
                {formatPrice(lineTotal(line))}
              </Typography>
            </div>
            <Box className="flex items-center gap-0 rounded-full border border-orange-200 bg-orange-50/50">
              <IconButton
                size="small"
                onClick={() => updateQuantity(line.id, line.quantity - 1)}
                aria-label="Decrease"
                sx={{ color: '#ea580c' }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" className="min-w-[1.5rem] text-center font-medium">
                {line.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => updateQuantity(line.id, line.quantity + 1)}
                aria-label="Increase"
                sx={{ color: '#ea580c' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            <IconButton
              size="small"
              onClick={() => removeLine(line.id)}
              aria-label="Remove"
              sx={{ color: '#6b7280' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>
      <Box className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
        <Typography variant="h6" fontWeight="bold" className="mb-4">
          Total: {formatPrice(totalPrice())}
        </Typography>
        <div className="flex flex-col gap-2">
          <Button
            component={Link}
            to={base}
            variant="outlined"
            fullWidth
            disabled={checkingOut}
            sx={{
              borderRadius: 2,
              borderColor: '#ea580c',
              color: '#ea580c',
              '&:hover': { borderColor: '#c2410c', backgroundColor: 'rgba(234,88,12,0.04)' },
            }}
          >
            Continue shopping
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={checkingOut}
            onClick={handleCheckout}
            startIcon={checkingOut ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              backgroundColor: '#ea580c',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#c2410c' },
            }}
          >
            {checkingOut ? 'Placing order…' : 'Checkout'}
          </Button>
        </div>
      </Box>
    </div>
  );
}
