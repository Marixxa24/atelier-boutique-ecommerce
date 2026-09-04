import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  isOpen: false,
  isCheckoutOpen: false,
  items: JSON.parse(localStorage.getItem('atelier_cart') || '[]'),
  lastOrder: null,

  // UI Toggles
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  
  openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  // Cart operations
  addItem: (item) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (i) => i.product === item.product && i.color === item.color && i.size === item.size
    );

    let newItems;
    if (existingIndex > -1) {
      newItems = items.map((i, idx) =>
        idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newItems = [...items, item];
    }

    localStorage.setItem('atelier_cart', JSON.stringify(newItems));
    set({ items: newItems, isOpen: true });
  },

  removeItem: (product, color, size) => {
    const { items } = get();
    const newItems = items.filter(
      (i) => !(i.product === product && i.color === color && i.size === size)
    );
    localStorage.setItem('atelier_cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  updateQuantity: (product, color, size, qty) => {
    if (qty <= 0) {
      get().removeItem(product, color, size);
      return;
    }
    const { items } = get();
    const newItems = items.map((i) =>
      i.product === product && i.color === color && i.size === size
        ? { ...i, quantity: qty }
        : i
    );
    localStorage.setItem('atelier_cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  clearCart: () => {
    localStorage.removeItem('atelier_cart');
    set({ items: [] });
  },

  setLastOrder: (order) => set({ lastOrder: order }),

  // Computations
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getShippingCost: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 50000 ? 0 : 3500;
  },

  getMissingForFreeShipping: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, 50000 - subtotal);
  },

  getTotalItemsCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));

export default useCartStore;
