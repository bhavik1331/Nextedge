import { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken } from "../api/axios.js";
import { useAuthStore } from "../store/authStore";

const AuthContext = createContext(null);

// Hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [member, setMember] = useState(null);
  const [memberAccessToken, setMemberAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Zustand Store binding function
  const storeSetAuth = useAuthStore((state) => state.setAuth);
  const storeClearAuth = useAuthStore((state) => state.clearAuth);

  // Use member token for API when member is logged in, else admin token
  useEffect(() => {
    setAuthToken(memberAccessToken || accessToken);
  }, [accessToken, memberAccessToken]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/admin/login", {
        username,
        password,
      });
      if (response.data.success) {
        const { accessToken: newToken, admin: adminData } = response.data;
        setAccessToken(newToken);
        setAdmin(adminData);
        setMember(null);
        setMemberAccessToken(null);
        // Hybrid: Force admin role into Zustand
        storeSetAuth({ id: adminData._id, name: adminData.username, email: adminData.username, role: 'ADMIN' });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const memberLogin = async (email, password) => {
    try {
      const response = await api.post("/members/login", {
        email,
        password,
      });
      if (response.data.success) {
        const { accessToken: newToken, member: memberData } = response.data;
        setMemberAccessToken(newToken);
        setMember(memberData);
        setAccessToken(null);
        setAdmin(null);
        // Sync normal member role into Zustand
        storeSetAuth({ id: memberData._id, name: memberData.name || memberData.email, email: memberData.email, role: memberData.role });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Member login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setAdmin(null);
      storeClearAuth();
    }
  };

  const memberLogout = async () => {
    try {
      await api.post("/members/logout");
    } catch (error) {
      console.error("Member logout error:", error);
    } finally {
      setMemberAccessToken(null);
      setMember(null);
      storeClearAuth();
    }
  };

  const refreshToken = async () => {
    try {
      const adminRes = await api.post("/admin/refresh");
      if (adminRes.data.success) {
        const { accessToken: newToken, admin: adminData } = adminRes.data;
        setAccessToken(newToken);
        setAdmin(adminData);
        setMember(null);
        setMemberAccessToken(null);
        storeSetAuth({ id: adminData._id, name: adminData.username, email: adminData.username, role: 'ADMIN' });
        return true;
      }
    } catch (e) {
      setAccessToken(null);
      setAdmin(null);
    }
    try {
      const memberRes = await api.post("/members/refresh");
      if (memberRes.data.success) {
        const { accessToken: newToken, member: memberData } = memberRes.data;
        setMemberAccessToken(newToken);
        setMember(memberData);
        storeSetAuth({ id: memberData._id, name: memberData.name || memberData.email, email: memberData.email, role: memberData.role });
        return true;
      }
    } catch (e) {
      setMemberAccessToken(null);
      setMember(null);
    }
    return false;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshToken();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    admin,
    member,
    loading,
    accessToken,
    login,
    logout,
    memberLogin,
    memberLogout,
    refreshToken,
    isAuthenticated: !!admin,
    isMember: !!member,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth };
