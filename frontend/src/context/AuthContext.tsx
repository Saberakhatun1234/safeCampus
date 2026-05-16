import { createContext, useContext, useEffect, useState } from "react";
type UserRole = "admin" | "student" | "security";
type UserType = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserType) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  // IMPORTANT
const [isLoading, setIsLoading] = useState(true);

  // LOGIN
  const login = (userData: UserType) => {
    setUser(userData);
  };

  // LOGOUT
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  // CHECK AUTH AFTER REFRESH
  const checkAuth = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // RUN WHEN APP STARTS
  useEffect(() => {
    checkAuth();
  }, []);
const isAuthenticated = !!user;
  return (
   <AuthContext.Provider
  value={{
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }}
>    {children}
  </AuthContext.Provider>
  );
};

// CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
