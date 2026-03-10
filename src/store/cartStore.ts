import { create } from 'zustand';
import type { MenuItem, Modifier, Variant } from '@/types/api';

export interface CartLine {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: Modifier[];
  selectedVariants: Variant[];
  specialInstructions?: string;
}

function lineTotal(line: CartLine): number {
  const base = line.menuItem.basePrice * line.quantity;
  const mods = line.selectedModifiers.reduce((s, m) => s + m.priceDelta * line.quantity, 0);
  const vars = line.selectedVariants.reduce((s, v) => s + v.priceDelta * line.quantity, 0);
  return base + mods + vars;
}

interface CartState {
  restaurantId: string | null;
  lines: CartLine[];
  setRestaurant: (id: string | null) => void;
  addItem: (restaurantId: string, line: Omit<CartLine, 'id'>) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

let lineIdCounter = 0;
function nextLineId() {
  return `line-${++lineIdCounter}-${Date.now()}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  lines: [],

  setRestaurant: (id) => set({ restaurantId: id }),

  addItem: (restaurantId, line) => {
    const { restaurantId: currentId, lines } = get();
    if (currentId && currentId !== restaurantId) get().clearCart();
    set({
      restaurantId,
      lines: currentId && currentId !== restaurantId ? [{ ...line, id: nextLineId() }] : [...lines, { ...line, id: nextLineId() }],
    });
  },

  updateQuantity: (lineId, quantity) => {
    if (quantity < 1) {
      get().removeLine(lineId);
      return;
    }
    set({
      lines: get().lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)),
    });
  },

  removeLine: (lineId) =>
    set({ lines: get().lines.filter((l) => l.id !== lineId) }),

  clearCart: () => set({ restaurantId: null, lines: [] }),

  totalItems: () => get().lines.reduce((s, l) => s + l.quantity, 0),

  totalPrice: () => get().lines.reduce((s, l) => s + lineTotal(l), 0),
}));
