import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [mode, setMode] = useState("login");
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];
});

const [orders, setOrders] = useState([]);
    const fetchMe = async () => {
    try {
        const response = await axios.get(
            "http://localhost:5000/api/auth/me",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setUser(response.data.user);

    } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        setToken("");
    }
};
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

    useEffect(() => {
    fetchProducts();

    if (token) {
        fetchMe();
        fetchMyOrders();
    }
}, []);
useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await axios.post("http://localhost:5000/api/auth/register", {
            company_name: companyName,
            email,
            password,
            phone: "",
            address: "",
            role,
        });

        console.log(response.data);
        alert("Реєстрація успішна. Тепер увійди.");
        setMode("login");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await axios.post("http://localhost:5000/api/auth/login", {
            email,
            password,
        });

        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
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
const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
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

const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
);
const fetchMyOrders = async () => {
    try {
        const response = await axios.get(
            "http://localhost:5000/api/orders/my",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setOrders(response.data.orders);
    } catch (error) {
        console.error(error);
    }
};
const handleCheckout = async () => {
    try {
        if (!token) {
            alert("Спочатку увійдіть в акаунт");
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

        const response = await axios.post(
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

        console.log(response.data);

        alert("Замовлення успішно створено!");

        setCart([]);
        localStorage.removeItem("cart");
        fetchMyOrders();
    } catch (error) {
        console.error(error);
        alert("Помилка при оформленні замовлення");
    }
};
    return (
        <div className="app">
            <div className="navbar">
                <span>Br1tuyHub</span>

                {token && (
                    <button onClick={handleLogout}>
                        Вийти
                    </button>
                )}
            </div>

            <div className="container">
                {!token && (
                    <div className="form-card">
                        <h1>{mode === "login" ? "Вхід" : "Реєстрація"}</h1>

                        {mode === "register" ? (
                            <form onSubmit={handleRegister}>
                                <input
                                    type="text"
                                    placeholder="Назва компанії"
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <select onChange={(e) => setRole(e.target.value)}>
                                    <option value="business">Бізнес</option>
                                    <option value="supplier">Постачальник</option>
                                </select>

                                <button type="submit">Зареєструватися</button>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button type="submit">Увійти</button>
                            </form>
                        )}

                        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
                            {mode === "login"
                                ? "Немає акаунта? Зареєструватися"
                                : "Вже є акаунт? Увійти"}
                        </button>
                    </div>
                )}

                {token && (
                    <>
                        <h2>Вітаємо в Br1tuyHub</h2>

                        {user && <p>Роль: {user.role}</p>}

                        {user?.role === "supplier" && (
                            <div className="form-card">
                                <h1>Create Product</h1>

                                <form onSubmit={handleCreateProduct}>
                                    <input
                                        type="text"
                                        placeholder="Назва товару"
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <input
                                        type="number"
                                        placeholder="Ціна"
                                        onChange={(e) => setPrice(e.target.value)}
                                    />

                                    <input
                                        type="file"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />

                                    <button type="submit">Створити товар</button>
                                </form>
                            </div>
                        )}
                    </>
                )}

                <h2>Products</h2>

<div className="products-grid">
    {products.map((product) => (
        <div className="product-card" key={product.id}>
            {product.image_url && (
                <img
                    src={`http://localhost:5000${product.image_url}`}
                    alt={product.name}
                />
            )}

            <div className="product-info">
                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <p className="price">
                    {product.price} грн / {product.unit}
                </p>

                <button onClick={() => addToCart(product)}>
                    Додати в кошик
                </button>
            </div>
        </div>
    ))}
</div>

<div className="cart-card">
    <h2>Кошик</h2>

    {cart.length === 0 ? (
        <p>Кошик порожній</p>
    ) : (
        <>
            {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                    <span>
                        {item.name} × {item.quantity}
                    </span>

                    <span>
                        {Number(item.price) * item.quantity} грн
                    </span>

                    <button onClick={() => removeFromCart(item.id)}>
                        Видалити
                    </button>
                </div>
            ))}

            <h3>Разом: {totalPrice} грн</h3>
            <button onClick={handleCheckout}>
    Оформити замовлення
</button>
        </>
    )}
</div>
</div>
        </div>
    );
}

export default App;