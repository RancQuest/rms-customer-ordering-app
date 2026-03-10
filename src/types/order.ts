// Request/response types for Ordering API

export interface VariantSnapshotDto {
  variantId: string;
  variantName: string;
  priceDelta: number;
}

export interface ModifierSnapshotDto {
  modifierId: string;
  modifierName: string;
  priceDelta: number;
}

export interface CreateOrderItemDto {
  menuItemId: string;
  menuItemName: string;
  basePrice: number;
  quantity: number;
  selectedVariants: VariantSnapshotDto[];
  selectedModifiers: ModifierSnapshotDto[];
  specialInstructions?: string;
  taxRate?: number;
}

export interface CreateOrderDto {
  tenantId: string;
  restaurantId: string;
  customerNotes?: string;
  tableNumber?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderRequest {
  order: CreateOrderDto;
}

export interface CreateOrderResponse {
  id: string;
}
