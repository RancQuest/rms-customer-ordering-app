import type { AxiosInstance } from 'axios';
import type {
  Menu,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  VariantGroup,
  PagedResult,
} from '@/types/api';

export function getActiveMenu(
  api: AxiosInstance,
  restaurantId: string,
  menuType?: number
) {
  const params = menuType != null ? { menuType } : {};
  return api.get<Menu>(`/api/menu/restaurants/${restaurantId}/menus/active`, { params });
}

export function getMenus(api: AxiosInstance, restaurantId: string) {
  return api.get<PagedResult<Menu>>(`/api/menu/restaurants/${restaurantId}/menus`);
}

export function getMenuCategories(api: AxiosInstance, restaurantId: string) {
  return api.get<MenuCategory[]>(`/api/menu/restaurants/${restaurantId}/menu-categories`);
}

export function getMenuItems(
  api: AxiosInstance,
  restaurantId: string,
  options?: { menuCategoryId?: string; menuId?: string }
) {
  return api.get<MenuItem[]>(`/api/menu/restaurants/${restaurantId}/menu-items`, {
    params: options,
  });
}

export function getMenuItemById(api: AxiosInstance, menuItemId: string) {
  return api.get<MenuItem>(`/api/menu/menu-items/${menuItemId}`);
}

export function getModifierGroups(api: AxiosInstance, restaurantId: string) {
  return api.get<ModifierGroup[]>(`/api/menu/restaurants/${restaurantId}/modifier-groups`);
}

export function getVariantGroups(api: AxiosInstance, restaurantId: string) {
  return api.get<VariantGroup[]>(`/api/menu/restaurants/${restaurantId}/variant-groups`);
}
