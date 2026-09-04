import { create } from 'zustand';

const useAuthStore = create((set) => ({
  admin: JSON.parse(localStorage.getItem('adminInfo')) || null,
  login: (adminData) => {
    localStorage.setItem('adminInfo', JSON.stringify(adminData));
    set({ admin: adminData });
  },
  logout: () => {
    localStorage.removeItem('adminInfo');
    set({ admin: null });
  },
}));

export default useAuthStore;
