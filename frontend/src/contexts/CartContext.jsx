import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const existingItem = cart.find((item) => item.id === product.id);
        const availableQuantity = Number(product.quantity_available);

        if (!Number.isFinite(availableQuantity) || availableQuantity <= 0) {
            toast.error("Цього товару немає в наявності");
            return;
        }

        if (
            cart.length > 0 &&
            cart[0].supplier_id !== product.supplier_id
        ) {
            toast.error("Можна оформити замовлення тільки в одного постачальника");
            return;
        }

        if (existingItem) {
            if (existingItem.quantity >= availableQuantity) {
                toast.error("Недостатньо товару на складі");
                return;
            }

            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item.id !== productId));
    };

    const increaseQuantity = (productId) => {
        setCart(
            cart.map((item) =>
                item.id === productId &&
                item.quantity < Number(item.quantity_available)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId) => {
        setCart(
            cart.map((item) =>
                item.id === productId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    const totalPrice = cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
