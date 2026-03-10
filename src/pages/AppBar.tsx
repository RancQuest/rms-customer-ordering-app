import { Link, useParams } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useCartStore } from '@/store/cartStore';

export function Header() {
  const { totalItems } = useCartStore();
  const params = useParams<{ restaurantSlug: string }>();
  const base = params.restaurantSlug ? `/${params.restaurantSlug}` : '';
  const count = totalItems();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        color: '#1f2937',
        borderBottom: '1px solid #ffedd5',
      }}
    >
      <Toolbar className="flex min-h-[64px] justify-end gap-1">
        <IconButton
          component={Link}
          to={`${base}/cart`}
          aria-label="Cart"
          sx={{
            color: '#374151',
            '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.08)' },
          }}
        >
          <Badge
            badgeContent={count}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <IconButton
          aria-label="Notifications"
          sx={{
            color: '#374151',
            '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.08)' },
          }}
        >
          <Badge badgeContent={1} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <Button
          component={Link}
          to={base}
          startIcon={<CardGiftcardIcon />}
          sx={{
            ml: 0.5,
            color: '#ea580c',
            fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.08)' },
          }}
        >
          Best Offer Deals
        </Button>
      </Toolbar>
    </AppBar>
  );
}
