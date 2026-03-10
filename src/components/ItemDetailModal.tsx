import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenuItemById } from '@/api/menu';
import { useRestaurant } from '@/context/RestaurantContext';
import { useCartStore } from '@/store/cartStore';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Box,
  TextField,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

interface ItemDetailModalProps {
  open: boolean;
  itemId: string | null;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export function ItemDetailModal({
  open,
  itemId,
  onClose,
  onAddedToCart,
}: ItemDetailModalProps) {
  const { restaurantId, api } = useRestaurant();
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const { data: item, isLoading } = useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: async () => {
      const { data } = await getMenuItemById(api, itemId!);
      return data as MenuItem;
    },
    enabled: !!itemId && !!restaurantId && open,
  });

  const hasVariants = (item?.variants?.length ?? 0) > 0;
  const hasModifiers = (item?.modifiers?.length ?? 0) > 0;

  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setSpecialInstructions('');
    if (hasVariants && item.variants!.length > 0) {
      setSelectedVariants([item.variants![0]]);
    } else {
      setSelectedVariants([]);
    }
    if (hasModifiers) {
      const defaults = (item.modifiers ?? []).filter((m) => m.isDefault);
      setSelectedModifiers(defaults);
    } else {
      setSelectedModifiers([]);
    }
  }, [item?.id, hasVariants, hasModifiers]);

  const handleAddToCart = () => {
    if (!item || !restaurantId) return;
    addItem(restaurantId, {
      menuItem: item,
      quantity,
      selectedModifiers,
      selectedVariants,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    onAddedToCart?.();
    onClose();
  };

  const totalPrice =
    (item?.basePrice ?? 0) * quantity +
    selectedVariants.reduce((s, v) => s + v.priceDelta * quantity, 0) +
    selectedModifiers.reduce((s, m) => s + m.priceDelta * quantity, 0);

  const canAddToCart = !hasVariants || selectedVariants.length > 0;

  const imageUrl =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80';

  const resetState = () => {
    setQuantity(1);
    setSelectedVariants([]);
    setSelectedModifiers([]);
    setSpecialInstructions('');
  };

  const dialogBody = isLoading ? (
    <Box className="flex justify-center py-12">
      <CircularProgress sx={{ color: '#f97316' }} />
    </Box>
  ) : !item ? (
    <Box className="py-8 text-center text-gray-500">Item not found.</Box>
  ) : (
    <div className="flex flex-col">
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col p-4 pb-2">
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {item.name}
        </Typography>
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon key={i} sx={{ fontSize: 18, color: '#f59e0b' }} />
          ))}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Typography fontWeight="bold" sx={{ color: '#ea580c', fontSize: '1.125rem' }}>
            {formatPrice(item.basePrice)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            {formatPrice(item.basePrice * 1.2)}
          </Typography>
        </div>

        {item.description && (
          <Box className="mt-4">
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary" sx={{ mb: 0.5 }}>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Box>
        )}

        {hasVariants && (
          <Box className="mt-4 rounded-xl border border-orange-100 bg-orange-50/30 p-3">
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                Size / Option
              </FormLabel>
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
                    label={
                      <span className="flex items-center justify-between gap-2">
                        <span>{v.name}</span>
                        {v.priceDelta !== 0 && (
                          <span className="text-orange-600 font-medium">
                            {v.priceDelta > 0 ? '+' : ''}{formatPrice(v.priceDelta)}
                          </span>
                        )}
                      </span>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {hasModifiers && (
          <Box className="mt-4 rounded-xl border border-orange-100 bg-orange-50/30 p-3">
            <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'block' }}>
              Add-ons
            </FormLabel>
            <Box className="flex flex-col gap-0.5">
              {(item.modifiers ?? []).map((m) => (
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
                  label={
                    <span className="flex items-center justify-between gap-2">
                      <span>{m.name}</span>
                      {m.priceDelta !== 0 && (
                        <span className="text-orange-600 text-sm font-medium">
                          {m.priceDelta > 0 ? '+' : ''}{formatPrice(m.priceDelta)}
                        </span>
                      )}
                    </span>
                  }
                />
              ))}
            </Box>
          </Box>
        )}

        <Box className="mt-4">
          <TextField
            fullWidth
            size="small"
            label="Special instructions"
            placeholder="e.g. No onions, extra sauce"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            multiline
            maxRows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fafafa',
              },
            }}
          />
        </Box>
      </div>

      <Divider />

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-orange-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-1">
            <IconButton
              size="small"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              sx={{ color: '#ea580c' }}
              aria-label="Decrease quantity"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-800">
              {quantity}
            </span>
            <IconButton
              size="small"
              onClick={() => setQuantity((q) => q + 1)}
              sx={{ color: '#ea580c' }}
              aria-label="Increase quantity"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#ea580c' }}>
            Total: {formatPrice(totalPrice)}
          </Typography>
        </div>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            backgroundColor: '#ea580c',
            fontWeight: 600,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': { backgroundColor: '#c2410c' },
            '&:disabled': { backgroundColor: '#fdba74', color: '#fff' },
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetState();
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <span className="font-semibold text-gray-800">Item details</span>
          <IconButton
            size="small"
            onClick={() => {
              resetState();
              onClose();
            }}
            aria-label="Close"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
          {dialogBody}
        </DialogContent>
      </div>
    </Dialog>
  );
}
