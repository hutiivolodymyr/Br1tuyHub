import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
            email,
            password,
        });

        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        setToken("");
        setUser(null);
    };

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