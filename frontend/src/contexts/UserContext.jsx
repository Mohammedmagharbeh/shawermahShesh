import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

// ✅ Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ phone: "", token: "", _id: "" });
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage on refresh
  useEffect(() => {
    const phone = sessionStorage.getItem("phone");
    const token = sessionStorage.getItem("jwt");
    const userId = sessionStorage.getItem("userId");

    if (phone && token && userId) {
      setUser({ _id: userId, phone, token });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem("phone", userData.phone);
    sessionStorage.setItem("jwt", userData.token);
    sessionStorage.setItem("userId", userData._id);

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Hook for easy usage
export const useUser = () => useContext(UserContext);
