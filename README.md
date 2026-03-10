# RMS Customer Ordering App

Modern customer-facing ordering web app for restaurants. Customers browse menus by restaurant slug (e.g. `https://yoursite.com/downtown-bistro`), view items, choose variants/modifiers, and add to cart.

## Stack

- **React 19** + **TypeScript**
- **Vite** – build and dev server
- **Material UI (MUI) v6** + **TailwindCSS**
- **TanStack Query (React Query)** – API data fetching
- **React Router** – routing by restaurant slug
- **Zustand** – cart state
- **Axios** – HTTP client with `x-restaurant-id` header

## Running locally

1. **YARP gateway + services** (in `rms-aspnetcore-microservices`):
   - Run the **YARP API Gateway** (e.g. `dotnet run` from `src/Shared/ApiGateways/YarpApiGateway`). It listens on `http://localhost:5000` and routes:
     - `/api/restaurants/*` → Restaurant Management (including `GET /api/restaurants/by-slug/{slug}`)
     - `/api/menu/*` → Menu Management
   - Run **Restaurant Management** and **Menu Management** services on the addresses configured in YARP’s `ReverseProxy:Clusters` (e.g. `appsettings.Development.json` or env/docker).

2. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```
   App runs at `http://localhost:3001`. Vite proxies `/api` to the YARP gateway at `http://localhost:5000`, so all API calls go through YARP. To call the gateway from another host, set `VITE_API_BASE_URL` (e.g. `http://localhost:5000`) in `.env`.

3. **URLs**:
   - `/` – placeholder with link to example slug
   - `/:restaurantSlug` – menu (e.g. `/downtown-bistro`)
   - `/:restaurantSlug/item/:itemId` – item detail and add to cart
   - `/:restaurantSlug/cart` – cart

## Behaviour

- Slug from the URL is used to **resolve the restaurant** via `GET /api/restaurants/by-slug/{slug}`.
- The resolved **restaurant ID** is sent as **`x-restaurant-id`** on all menu API requests and used in paths (e.g. `/api/menu/restaurants/{restaurantId}/menu-items`).
- Cart is scoped per restaurant; switching slug clears or replaces the cart.

## Env

- `VITE_API_BASE_URL` – optional; base URL for API. Empty = same origin (use Vite proxy in dev).
