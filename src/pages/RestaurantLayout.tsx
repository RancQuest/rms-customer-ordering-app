import { Outlet, useParams, useLocation } from 'react-router-dom';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { Header } from './AppBar';
import { MenuSidebar } from '@/components/MenuSidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function RestaurantLayout() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const location = useLocation();
  const slug = restaurantSlug ?? '';

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-8 text-center text-gray-600">
        <p>Enter a restaurant slug in the URL, e.g. /downtown-bistro</p>
      </div>
    );
  }

  const isMenuOrCart =
    location.pathname === `/${slug}` ||
    location.pathname.startsWith(`/${slug}/menu/`) ||
    location.pathname === `/${slug}/cart` ||
    location.pathname.startsWith(`/${slug}/item/`);

  return (
    <RestaurantProvider slug={slug}>
      <div className="flex min-h-screen bg-[#faf8f5]">
        {isMenuOrCart && <MenuSidebar />}
        <div className="flex min-h-screen flex-1 flex-col bg-white">
          <Header />
          <main className="min-h-[calc(100vh-64px)] flex-1 pb-8">
            {isMenuOrCart && location.pathname !== `/${slug}/cart` && (
              <Breadcrumbs />
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </RestaurantProvider>
  );
}
