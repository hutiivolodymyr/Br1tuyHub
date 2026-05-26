import { useState } from "react";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";

function HomePage({
    token,
    user,
    mode,
    setMode,
    handleRegister,
    handleLogin,
    setCompanyName,
    setEmail,
    setPassword,
    setRole,
    handleCreateProduct,
    setName,
    setPrice,
    setImage,
    products,
    addToCart,
    cart,
    totalPrice,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    handleCheckout,
    setUnit,
    setQuantityAvailable,
}) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
        selectedCategory === "all" ||
        product.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
});

const categories = [
    "all",
    ...new Set(products.map((product) => product.category_name).filter(Boolean)),
];
    return (
        <>
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
                                <select onChange={(e) => setUnit(e.target.value)}>
                                <option value="кг">за кг</option>
                                <option value="100 г">за 100 г</option>
                                <option value="шт">за штуку</option>
                                <option value="л">за літр</option>
                                <option value="упаковка">за упаковку</option>
                            </select>

                        <input
    type="number"
    placeholder="Кількість в наявності"
    onChange={(e) => setQuantityAvailable(e.target.value)}
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
            <div className="filters">
    <input
        type="text"
        placeholder="Пошук товару..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
    />

    <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
    >
        {categories.map((category) => (
            <option key={category} value={category}>
                {category === "all" ? "Усі категорії" : category}
            </option>
        ))}
    </select>
</div>

            <div className="products-grid">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        user={user}
                        addToCart={addToCart}
                    />
                ))}
            </div>

            {user?.role === "business" && (
<Cart
    cart={cart}
    totalPrice={totalPrice}
    removeFromCart={removeFromCart}
    handleCheckout={handleCheckout}
    increaseQuantity={increaseQuantity}
    decreaseQuantity={decreaseQuantity}
/>
            )}
        </>
    );
}

export default HomePage;