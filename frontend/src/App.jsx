import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [mode, setMode] = useState("login");
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);

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
    }, []);

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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;