import { create } from 'zustand';

const useCustomerAuthStore = create((set) => ({
  customer: JSON.parse(localStorage.getItem('customerInfo')) || null,
  isAuthModalOpen: false,
  authModalTab: 'login', // 'login' | 'register'

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginCustomer: (customerData) => {
    localStorage.setItem('customerInfo', JSON.stringify(customerData));
    set({ customer: customerData, isAuthModalOpen: false });
  },

  logoutCustomer: () => {
    localStorage.removeItem('customerInfo');
    set({ customer: null });
  },

  updateCustomerProfile: (updatedData) => {
    set((state) => {
      const merged = { ...state.customer, ...updatedData };
      localStorage.setItem('customerInfo', JSON.stringify(merged));
      return { customer: merged };
    });
  }
}));

export default useCustomerAuthStore;
