import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import SupplierDashboard from "./pages/SupplierDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import Cart from "./components/Cart";
import { toast } from "react-toastify";

import { useAuth } from "./contexts/AuthContext";
import { useCart } from "./contexts/CartContext";

function App() {
    const { token, user, setUser, login, logout } = useAuth();

    const {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        increaseQuantity,
        decreaseQuantity,
    } = useCart();

    const [mode, setMode] = useState("login");
    const [orders, setOrders] = useState([]);

    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("business");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [unit, setUnit] = useState("кг");
    const [quantityAvailable, setQuantityAvailable] = useState("");
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data.products);
    };

    const fetchMe = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data.user);
        } catch (error) {
            console.error(error);
            logout();
        }
    };

    const fetchMyOrders = async () => {
        try {
            if (!token) return;

            const response = await axios.get("http://localhost:5000/api/orders/my", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(response.data.orders);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();

        if (token) {
            fetchMe();
            fetchMyOrders();
        }
    }, [token]);

    const handleRegister = async (e) => {
        e.preventDefault();

        await axios.post("http://localhost:5000/api/auth/register", {
            company_name: companyName,
            email,
            password,
            phone: "",
            address: "",
            role,
        });

        toast.success("Реєстрація успішна");
        setMode("login");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleLogout = () => {
        logout();
        clearCart();
        setOrders([]);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("category_id", 1);
        formData.append("name", name);
        formData.append("description", "Тест");
        formData.append("price", price);
        formData.append("unit", unit);
        formData.append("quantity_available", quantityAvailable);

        if (image) {
            formData.append("image", image);
        }

        await axios.post("http://localhost:5000/api/products", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchProducts();
    };

    const handleCheckout = async () => {
        try {
            if (!token) {
                alert("Спочатку увійдіть в акаунт");
                return;
            }

            if (user?.role !== "business") {
                alert("Оформлювати замовлення може тільки бізнес-користувач");
                return;
            }

            if (cart.length === 0) {
                alert("Кошик порожній");
                return;
            }

            const supplier_id = cart[0].supplier_id;

            const items = cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            }));

            await axios.post(
                "http://localhost:5000/api/orders",
                {
                    supplier_id,
                    items,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Замовлення успішно створено");

            clearCart();
            fetchMyOrders();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при оформленні замовлення");
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при видаленні товару");
        }
    };

    const updateProduct = async (productId, updatedData) => {
        try {
            await axios.put(
                `http://localhost:5000/api/products/${productId}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при редагуванні товару");
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchMyOrders();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при зміні статусу");
        }
    };

    return (
        <div className="app">
            <Navbar token={token} user={user} handleLogout={handleLogout} />

            <div className="container">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                token={token}
                                user={user}
                                mode={mode}
                                setMode={setMode}
                                handleRegister={handleRegister}
                                handleLogin={handleLogin}
                                setCompanyName={setCompanyName}
                                setEmail={setEmail}
                                setPassword={setPassword}
                                setRole={setRole}
                                handleCreateProduct={handleCreateProduct}
                                setName={setName}
                                setPrice={setPrice}
                                setImage={setImage}
                                setUnit={setUnit}
                                setQuantityAvailable={setQuantityAvailable}
                                products={products}
                                addToCart={addToCart}
                                cart={cart}
                                totalPrice={totalPrice}
                                removeFromCart={removeFromCart}
                                increaseQuantity={increaseQuantity}
                                decreaseQuantity={decreaseQuantity}
                                handleCheckout={handleCheckout}
                            />
                        }
                    />
                    <Route
                        path="/products/:id"
                        element={<ProductDetailsPage />}
                    />
                    <Route
    path="/cart"
    element={
        <ProtectedRoute token={token}>
            <RoleProtectedRoute user={user} allowedRoles={["business"]}>
                <div className="cart-page">
                    <Cart
                        cart={cart}
                        totalPrice={totalPrice}
                        removeFromCart={removeFromCart}
                        increaseQuantity={increaseQuantity}
                        decreaseQuantity={decreaseQuantity}
                        handleCheckout={handleCheckout}
                    />
                </div>
            </RoleProtectedRoute>
        </ProtectedRoute>
    }
/>
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute token={token}>
                            <RoleProtectedRoute user={user} allowedRoles={["business"]}>
                            <FavoritesPage />
                            </RoleProtectedRoute>
                            </ProtectedRoute>
    }
/>
                    <Route
                        path="/business"
                        element={
                            <ProtectedRoute token={token}>
                                <RoleProtectedRoute user={user} allowedRoles={["business"]}>
                                    <BusinessDashboard orders={orders} />
                                </RoleProtectedRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute token={token}>
                                <RoleProtectedRoute
                                    user={user}
                                    allowedRoles={["business", "supplier"]}
                                >
                                    <OrdersPage orders={orders} />
                                </RoleProtectedRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute token={token}>
                                <OrderDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/supplier"
                        element={
                            <ProtectedRoute token={token}>
                                <RoleProtectedRoute user={user} allowedRoles={["supplier"]}>
                                    <SupplierDashboard
                                        products={products}
                                        user={user}
                                        orders={orders}
                                        deleteProduct={deleteProduct}
                                        updateProduct={updateProduct}
                                        updateOrderStatus={updateOrderStatus}
                                    />
                                </RoleProtectedRoute>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;