export interface Restaurant {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  brand?: string;
  status: string;
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Menu {
  id: string;
  tenantId: string;
  restaurantId: string;
  name: string;
  menuType: number;
  description?: string;
  publishState: number;
  categoryLinks?: MenuCategoryMenu[];
}

export interface MenuCategoryMenu {
  id: string;
  menuCategoryId: string;
  categoryName?: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface MenuCategory {
  id: string;
  tenantId: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  menuCategoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  displayOrder: number;
  dietaryInfo?: string;
  isActive: boolean;
  modifiers: Modifier[];
  variants: Variant[];
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
}

export interface Variant {
  id: string;
  variantGroupId: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  tenantId: string;
  restaurantId: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  modifiers: Modifier[];
}

export interface VariantGroup {
  id: string;
  tenantId: string;
  restaurantId: string;
  name: string;
  variants: Variant[];
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
