import { useState } from "react";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { UKRAINE_REGIONS } from "../utils/regions";

function HomePage({
    token,
    user,
    mode,
    setMode,
    role,
    setRole,
    handleRegister,
    handleLogin,
    setCompanyName,
    setEmail,
    setPassword,
    registrationRegion,
    setRegistrationRegion,
    products,
    productPagination,
    fetchProducts,
    addToCart,
    cart,
    totalPrice,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    handleCheckout,
    deliveryPhone,
    setDeliveryPhone,
    deliveryAddress,
    setDeliveryAddress,
    deliveryComment,
    setDeliveryComment,
}) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSupplierRegion, setSelectedSupplierRegion] = useState("all");

    const getProductFilters = (supplierRegion = selectedSupplierRegion) => {
        if (!supplierRegion || supplierRegion === "all") {
            return {};
        }

        return {
            supplier_region: supplierRegion,
        };
    };

    const handleSupplierRegionChange = (event) => {
        const nextRegion = event.target.value;

        setSelectedSupplierRegion(nextRegion);
        fetchProducts(1, getProductFilters(nextRegion));
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" ||
            product.category_name === selectedCategory;

        const matchesRegion =
            selectedSupplierRegion === "all" ||
            product.supplier_region === selectedSupplierRegion;

        return matchesSearch && matchesCategory && matchesRegion;
    });

    const categories = [
        "all",
        ...new Set(products.map((product) => product.category_name).filter(Boolean)),
    ];

    const myProductsCount = products.filter(
        (product) => product.supplier_id === user?.id
    ).length;

    if (!token) {
        return (
            <section className="landing-screen">
                <div className="landing-inner">
                    <div className="landing-left">
                        <div className="landing-badge">
                            B2B Marketplace
                        </div>

                        <h1 className="landing-title">
                            Br1tuyHub — платформа для закупівель без зайвих дій
                        </h1>

                        <p className="landing-description">
                            Знаходьте товари, оформлюйте замовлення та керуйте
                            постачанням у зручному онлайн-кабінеті для бізнесу
                            і постачальників.
                        </p>

                        <div className="landing-features">
                            <div className="feature-card">
                                <h3>Каталог товарів</h3>
                                <p>
                                    Швидкий пошук потрібної продукції від різних
                                    постачальників.
                                </p>
                            </div>

                            <div className="feature-card">
                                <h3>Окремі ролі</h3>
                                <p>
                                    Зручна робота як для бізнесу, так і для
                                    постачальників.
                                </p>
                            </div>

                            <div className="feature-card">
                                <h3>Контроль замовлень</h3>
                                <p>
                                    Відстеження статусів, кількості товару та
                                    постачань в одному місці.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="landing-right">
                        <div className="auth-panel">
                            <div className="auth-tabs">
                                <button
                                    type="button"
                                    className={mode === "login" ? "active" : ""}
                                    onClick={() => setMode("login")}
                                >
                                    Вхід
                                </button>

                                <button
                                    type="button"
                                    className={mode === "register" ? "active" : ""}
                                    onClick={() => setMode("register")}
                                >
                                    Реєстрація
                                </button>
                            </div>

                            <div className="auth-content">
                                <h2>
                                    {mode === "login"
                                        ? "Увійти в акаунт"
                                        : "Створити акаунт"}
                                </h2>

                                {mode === "register" ? (
                                    <form className="auth-form" onSubmit={handleRegister}>
                                        <input
                                            type="text"
                                            placeholder="Назва компанії"
                                            onChange={(e) =>
                                                setCompanyName(e.target.value)
                                            }
                                        />

                                        <input
                                            type="email"
                                            placeholder="Email"
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />

                                        <input
                                            type="password"
                                            placeholder="Пароль"
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />

                                        <div className="role-switch">
                                            <button
                                                type="button"
                                                className={
                                                    role === "business" ? "active" : ""
                                                }
                                                onClick={() => setRole("business")}
                                            >
                                                Бізнес
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    role === "supplier" ? "active" : ""
                                                }
                                                onClick={() => setRole("supplier")}
                                            >
                                                Постачальник
                                            </button>
                                        </div>

                                        <select
                                            value={registrationRegion}
                                            onChange={(e) =>
                                                setRegistrationRegion(e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Оберіть область</option>
                                            {UKRAINE_REGIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>

                                        <button className="auth-submit" type="submit">
                                            Зареєструватися
                                        </button>
                                    </form>
                                ) : (
                                    <form className="auth-form" onSubmit={handleLogin}>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />

                                        <input
                                            type="password"
                                            placeholder="Пароль"
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />

                                        <button className="auth-submit" type="submit">
                                            Увійти
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="home-hero">
                <div>
                    <span className="home-badge">
                        {user?.role === "supplier" ? "Постачальник" : "Бізнес"}
                    </span>

                    <h1>
                        Вітаємо, {user?.company_name || "користувачу"}
                    </h1>

                    <p>
                        {user?.role === "supplier"
                            ? "Керуйте товарами, залишками та замовленнями у кабінеті постачальника."
                            : "Переглядайте каталог, додавайте товари в кошик та оформлюйте замовлення."}
                    </p>
                </div>

                <div className={user?.role === "supplier" ? "home-hero-cards supplier-hero-cards" : "home-hero-cards"}>
                    {user?.role === "supplier" ? (
                        <>
                            <div>
                                <strong>{myProductsCount}</strong>
                                <span>Мої товари</span>
                            </div>

                            <div>
                                <>
                                    <strong>↗</strong>
                                    <span>Кабінет постачальника</span>
                                </>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <strong>{products.length}</strong>
                                <span>Товарів у каталозі</span>
                            </div>

                            <div>
                                <strong>{cart.length}</strong>
                                <span>Позицій у кошику</span>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <h2 className="section-title">Каталог товарів</h2>

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

                {user?.role === "business" && (
                    <select
                        className="supplier-region-select"
                        value={selectedSupplierRegion}
                        onChange={handleSupplierRegionChange}
                    >
                        <option value="all">Усі області постачальників</option>
                        {user?.region && (
                            <option value={user.region}>
                                Моя область: {user.region}
                            </option>
                        )}
                        {UKRAINE_REGIONS
                            .filter((item) => item !== user?.region)
                            .map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                    </select>
                )}
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

            <div className="pagination-bar">
                <button
                    disabled={productPagination.page <= 1}
                    onClick={() => fetchProducts(
                        productPagination.page - 1,
                        getProductFilters()
                    )}
                >
                    Назад
                </button>

                <span>
                    Сторінка {productPagination.page} з {productPagination.totalPages || 1}
                </span>

                <button
                    disabled={productPagination.page >= (productPagination.totalPages || 1)}
                    onClick={() => fetchProducts(
                        productPagination.page + 1,
                        getProductFilters()
                    )}
                >
                    Далі
                </button>
            </div>

            {user?.role === "business" && (
                <Cart
                    cart={cart}
                    totalPrice={totalPrice}
                    removeFromCart={removeFromCart}
                    handleCheckout={handleCheckout}
                    increaseQuantity={increaseQuantity}
                    decreaseQuantity={decreaseQuantity}
                    deliveryPhone={deliveryPhone}
                    setDeliveryPhone={setDeliveryPhone}
                    deliveryAddress={deliveryAddress}
                    setDeliveryAddress={setDeliveryAddress}
                    deliveryComment={deliveryComment}
                    setDeliveryComment={setDeliveryComment}
                />
            )}
        </>
    );
}

export default HomePage;
