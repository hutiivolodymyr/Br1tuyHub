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
    handleCheckout,
}) {
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
                />
            )}
        </>
    );
}

export default HomePage;