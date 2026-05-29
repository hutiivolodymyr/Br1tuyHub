import { createContext, useCallback, useContext, useState } from "react";
import apiClient from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);

    const login = useCallback(async (email, password) => {
        const response = await apiClient.post("/api/auth/login", {
            email,
            password,
        });

        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        setToken("");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
