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

    const parseQuantity = (quantity) => {
        if (typeof quantity === "string") {
            return Number(quantity.replace(",", "."));
        }

        return Number(quantity);
    };

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

            const nextQuantity = Math.min(
                Number(existingItem.quantity) + 1,
                availableQuantity
            );

            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: nextQuantity }
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
                    ? {
                        ...item,
                        quantity: Math.min(
                            Number(item.quantity) + 1,
                            Number(item.quantity_available)
                        ),
                    }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId) => {
        setCart(
            cart.map((item) =>
                item.id === productId && item.quantity > 1
                    ? { ...item, quantity: Math.max(Number(item.quantity) - 1, 1) }
                    : item
            )
        );
    };

    const updateQuantity = (productId, quantity) => {
        const nextQuantity = parseQuantity(quantity);

        if (!Number.isFinite(nextQuantity)) {
            return;
        }

        const cartItem = cart.find((item) => item.id === productId);

        if (!cartItem) {
            return;
        }

        const availableQuantity = Number(cartItem.quantity_available);

        if (!Number.isFinite(availableQuantity) || availableQuantity <= 0) {
            toast.error("Цього товару немає в наявності");
            return;
        }

        if (nextQuantity > availableQuantity) {
            toast.error("Недостатньо товару на складі");
        }

        const clampedQuantity = Math.min(
            Math.max(nextQuantity, 1),
            availableQuantity
        );

        setCart(
            cart.map((item) =>
                item.id === productId
                    ? { ...item, quantity: clampedQuantity }
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
                updateQuantity,
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
