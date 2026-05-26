import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import { useAuth } from "./contexts/AuthContext";
import { useCart } from "./contexts/CartContext";



function App() {
    const {
    token,
    user,
    setUser,
    login,
    logout,
} = useAuth();
const {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    totalPrice,
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
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
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

        alert("Реєстрація успішна. Тепер увійди.");
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
        formData.append("unit", "кг");
        formData.append("quantity_available", 10);

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

            alert("Замовлення успішно створено!");

clearCart();
            fetchMyOrders();
        } catch (error) {
            console.error(error);
            alert("Помилка при оформленні замовлення");
        }
    };

    return (
        <div className="app">
<Navbar
    token={token}
    user={user}
    handleLogout={handleLogout}
/>  

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
                    products={products}
                    addToCart={addToCart}
                    cart={cart}
                    totalPrice={totalPrice}
                    removeFromCart={removeFromCart}
                    handleCheckout={handleCheckout}
                />
            }
        />

<Route
    path="/orders"
    element={<OrdersPage orders={orders} />}
/>
    </Routes>
</div>
        </div>
    );
}

export default App;