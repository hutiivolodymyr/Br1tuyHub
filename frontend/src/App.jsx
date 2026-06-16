import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { toast } from "react-toastify";
import "./App.css";
import apiClient from "./api/client";

import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import HomePage from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import SupplierDashboard from "./pages/SupplierDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";

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
        updateQuantity,
    } = useCart();

    const [mode, setMode] = useState("login");
    const [orders, setOrders] = useState([]);

    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("business");
    const [registrationRegion, setRegistrationRegion] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [unit, setUnit] = useState("кг");
    const [quantityAvailable, setQuantityAvailable] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productPagination, setProductPagination] = useState({
        page: 1,
        totalPages: 1,
    });
    const [orderStatusFilter, setOrderStatusFilter] = useState("");
    const [orderPage, setOrderPage] = useState(1);
    const [deliveryPhone, setDeliveryPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryComment, setDeliveryComment] = useState("");

    useEffect(() => {
        setDeliveryPhone(user?.phone || "");
        setDeliveryAddress(user?.address || "");
    }, [user]);

    const fetchProducts = useCallback(async (page = 1, filters = {}) => {
        const response = await apiClient.get("/api/products", {
            params: {
                page,
                limit: 12,
                ...filters,
            },
        });
        setProducts(response.data.products);
        setProductPagination(response.data.pagination || { page, totalPages: 1 });
    }, []);

    const fetchCategories = useCallback(async () => {
        const response = await apiClient.get("/api/categories");
        setCategories(response.data.categories);

        if (!categoryId && response.data.categories.length > 0) {
            setCategoryId(String(response.data.categories[0].id));
        }
    }, [categoryId]);

    const fetchMe = useCallback(async () => {
        try {
            const response = await apiClient.get("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data.user);
        } catch (error) {
            console.error(error);
            logout();
        }
    }, [logout, setUser, token]);

    const fetchMyOrders = useCallback(async () => {
        try {
            if (!token) return;

            const response = await apiClient.get("/api/orders/my", {
                params: {
                    page: orderPage,
                    limit: 10,
                    status: orderStatusFilter || undefined,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(response.data.orders);
        } catch (error) {
            console.error(error);
        }
    }, [orderPage, orderStatusFilter, token]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();

        if (token) {
            fetchMe();
            fetchMyOrders();
        }
    }, [fetchCategories, fetchMe, fetchMyOrders, fetchProducts, token]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!registrationRegion) {
            toast.error("Оберіть область компанії");
            return;
        }

        await apiClient.post("/api/auth/register", {
            company_name: companyName,
            email,
            password,
            phone: "",
            address: "",
            region: registrationRegion,
            role,
        });

        toast.success("Реєстрація успішна");
        setRegistrationRegion("");
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

        if (!name.trim() || !description.trim() || !price || !quantityAvailable || !categoryId) {
            toast.error("Заповніть назву, опис, категорію, ціну і кількість");
            return;
        }

        const formData = new FormData();
        formData.append("category_id", categoryId);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("unit", unit);
        formData.append("quantity_available", quantityAvailable);

        if (image) {
            formData.append("image", image);
        }

        await apiClient.post("/api/products", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchProducts();
        setName("");
        setDescription("");
        setPrice("");
        setQuantityAvailable("");
        setImage(null);
    };

    const handleCheckout = async () => {
        try {
            if (!token) {
                toast.error("Спочатку увійдіть в акаунт");
                return;
            }

            if (user?.role !== "business") {
                toast.error("Оформлювати замовлення може тільки бізнес-користувач");
                return;
            }

            if (cart.length === 0) {
                toast.error("Кошик порожній");
                return;
            }

            if (!deliveryPhone.trim() || !deliveryAddress.trim()) {
                toast.error("Вкажіть телефон і адресу доставки");
                return;
            }

            const supplier_id = cart[0].supplier_id;
            const hasMixedSuppliers = cart.some(
                (item) => item.supplier_id !== supplier_id
            );

            if (hasMixedSuppliers) {
                toast.error("У кошику можуть бути товари тільки одного постачальника");
                return;
            }

            const items = cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            }));

            await apiClient.post(
                "/api/orders",
                {
                    supplier_id,
                    items,
                    delivery_phone: deliveryPhone,
                    delivery_address: deliveryAddress,
                    delivery_comment: deliveryComment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Замовлення успішно створено");

            clearCart();
            setDeliveryComment("");
            fetchMyOrders();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при оформленні замовлення");
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await apiClient.delete(`/api/products/${productId}`, {
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
            await apiClient.put(
                `/api/products/${productId}`,
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
            await apiClient.put(
                `/api/orders/${orderId}/status`,
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
        <div className={token ? "app" : "app auth-app"}>
            {token && (
                <Navbar
                    token={token}
                    user={user}
                    handleLogout={handleLogout}
                />
            )}

            <div className={token ? "container" : "auth-container"}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                role={role}
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
                                registrationRegion={registrationRegion}
                                setRegistrationRegion={setRegistrationRegion}
                                products={products}
                                productPagination={productPagination}
                                fetchProducts={fetchProducts}
                                addToCart={addToCart}
                                cart={cart}
                                totalPrice={totalPrice}
                                removeFromCart={removeFromCart}
                                increaseQuantity={increaseQuantity}
                                decreaseQuantity={decreaseQuantity}
                                updateQuantity={updateQuantity}
                                handleCheckout={handleCheckout}
                                deliveryPhone={deliveryPhone}
                                setDeliveryPhone={setDeliveryPhone}
                                deliveryAddress={deliveryAddress}
                                setDeliveryAddress={setDeliveryAddress}
                                deliveryComment={deliveryComment}
                                setDeliveryComment={setDeliveryComment}
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
                                            updateQuantity={updateQuantity}
                                            handleCheckout={handleCheckout}
                                            deliveryPhone={deliveryPhone}
                                            setDeliveryPhone={setDeliveryPhone}
                                            deliveryAddress={deliveryAddress}
                                            setDeliveryAddress={setDeliveryAddress}
                                            deliveryComment={deliveryComment}
                                            setDeliveryComment={setDeliveryComment}
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
                                    allowedRoles={["business", "supplier", "admin"]}
                                >
                                    <OrdersPage
                                        orders={orders}
                                        statusFilter={orderStatusFilter}
                                        setStatusFilter={setOrderStatusFilter}
                                        orderPage={orderPage}
                                        setOrderPage={setOrderPage}
                                    />
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
                        path="/profile"
                        element={
                            <ProtectedRoute token={token}>
                                <ProfilePage orders={orders} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute token={token}>
                                <RoleProtectedRoute user={user} allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </RoleProtectedRoute>
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
                                        handleCreateProduct={handleCreateProduct}
                                        categories={categories}
                                        setName={setName}
                                        setDescription={setDescription}
                                        setPrice={setPrice}
                                        setImage={setImage}
                                        setUnit={setUnit}
                                        setQuantityAvailable={setQuantityAvailable}
                                        setCategoryId={setCategoryId}
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
