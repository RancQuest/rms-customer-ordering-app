import { Link, useParams } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRestaurant } from '@/context/RestaurantContext';
import { useCartStore } from '@/store/cartStore';

export function Header() {
  const { slug, restaurant, isLoading } = useRestaurant();
  const { totalItems } = useCartStore();
  const params = useParams<{ restaurantSlug: string }>();
  const base = params.restaurantSlug ? `/${params.restaurantSlug}` : '';

  return (
    <AppBar position="sticky" className="shadow">
      <Toolbar className="flex justify-between">
        <Link to={base} className="text-inherit no-underline">
          <Typography variant="h6" component="span" fontWeight="bold">
            {isLoading ? '...' : restaurant?.name ?? slug}
          </Typography>
        </Link>
        <IconButton color="inherit" component={Link} to={`${base}/cart`} aria-label="Cart">
          <Badge badgeContent={totalItems()} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
