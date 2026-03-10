import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { RestaurantLayout } from '@/pages/RestaurantLayout';
import { MenuPage } from '@/pages/MenuPage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { CartPage } from '@/pages/CartPage';
import { Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function HomePlaceholder() {
  return (
    <Box className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-8">
      <Typography variant="h5" fontWeight="bold">
        Customer ordering
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Visit a restaurant by slug, e.g.{' '}
        <Link to="/downtown-bistro" className="text-primary underline">
          /downtown-bistro
        </Link>
      </Typography>
    </Box>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#ea580c' },
    secondary: { main: '#16a34a' },
  },
  shape: { borderRadius: 12 },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/:restaurantSlug" element={<RestaurantLayout />}>
              <Route index element={<MenuPage />} />
              <Route path="menu/:menuId" element={<MenuPage />} />
              <Route path="menu/:menuId/category/:categoryId" element={<MenuPage />} />
              <Route path="item/:itemId" element={<ItemDetailPage />} />
              <Route path="cart" element={<CartPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
