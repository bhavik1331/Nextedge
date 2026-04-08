import { create } from 'zustand';

// This is the global state store that natively supports our new SaaS RBAC requirements
export const useAuthStore = create((set) => ({
  user: null, // Holds { id, name, email, trueRole }
  activeViewRole: null, // "MEMBER", "ADMIN", "TREASURER", etc.
  
  // Method to log in the user and lock their true DB role
  setAuth: (user) => set({ 
    user: { ...user, trueRole: user.role || 'MEMBER' }, 
    activeViewRole: user.role || 'MEMBER' 
  }),

  // Method to log out
  clearAuth: () => set({ user: null, activeViewRole: null }),
  
  // Context View Switcher: e.g. A TREASURER wants to see the screen as a MEMBER
  switchViewRole: (newView) => set((state) => {
    if (!state.user) return state;

    // Only elevated users are allowed to shift contexts
    const elevatedRoles = ['ADMIN', 'CLUB_HEAD', 'TREASURER'];
    
    // If they are an elevated role, let them shift their UI context anywhere
    if (elevatedRoles.includes(state.user.trueRole)) {
      return { activeViewRole: newView };
    }
    
    // Standard members cannot shift contexts up
    return state;
  })
}));
