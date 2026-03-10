import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCartStore } from '@/store/cartStore';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function lineTotal(line: { menuItem: { basePrice: number }; quantity: number; selectedModifiers: { priceDelta: number }[]; selectedVariants: { priceDelta: number }[] }) {
  const base = line.menuItem.basePrice * line.quantity;
  const mods = line.selectedModifiers.reduce((s, m) => s + m.priceDelta * line.quantity, 0);
  const vars = line.selectedVariants.reduce((s, v) => s + v.priceDelta * line.quantity, 0);
  return base + mods + vars;
}

export function CartPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const base = `/${restaurantSlug}`;
  const { lines, updateQuantity, removeLine, totalPrice, totalItems } = useCartStore();

  if (totalItems() === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <Typography variant="h6" color="text.secondary">
          Your cart is empty
        </Typography>
        <Button component={Link} to={base} variant="contained" className="mt-4">
          Browse menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Typography variant="h5" fontWeight="bold" className="mb-4">
        Your order
      </Typography>
      <div className="space-y-3">
        {lines.map((line) => (
          <Card key={line.id}>
            <CardContent className="flex flex-row items-center justify-between gap-2">
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
                <Typography variant="body2" fontWeight="600">
                  {formatPrice(lineTotal(line))}
                </Typography>
              </div>
              <Box className="flex items-center gap-0">
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(line.id, line.quantity - 1)}
                  aria-label="Decrease"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" className="min-w-[1.5rem] text-center">
                  {line.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                  aria-label="Increase"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeLine(line.id)}
                  aria-label="Remove"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>
      <Box className="mt-6 flex flex-col gap-2">
        <Typography variant="h6">
          Total: {formatPrice(totalPrice())}
        </Typography>
        <Button component={Link} to={base} variant="outlined" fullWidth>
          Continue shopping
        </Button>
        <Button variant="contained" fullWidth disabled>
          Checkout (coming soon)
        </Button>
      </Box>
    </div>
  );
}
