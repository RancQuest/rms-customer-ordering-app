import { Outlet, useParams } from 'react-router-dom';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { Header } from './AppBar';

export function RestaurantLayout() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const slug = restaurantSlug ?? '';

  if (!slug) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p>Enter a restaurant slug in the URL, e.g. /downtown-bistro</p>
      </div>
    );
  }

  return (
    <RestaurantProvider slug={slug}>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-20">
        <Outlet />
      </main>
    </RestaurantProvider>
  );
}
