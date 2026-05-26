import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem("favorites");

        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );
    }, [favorites]);

    const toggleFavorite = (product) => {
        const exists = favorites.find(
            (item) => item.id === product.id
        );

        if (exists) {
            setFavorites(
                favorites.filter((item) => item.id !== product.id)
            );
        } else {
            setFavorites([...favorites, product]);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(
            (item) => item.id === productId
        );
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                toggleFavorite,
                isFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    return useContext(FavoritesContext);
};