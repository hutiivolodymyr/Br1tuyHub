import { useState } from "react";

function SupplierDashboard({
    products,
    user,
    orders,
    deleteProduct,
    updateProduct,
    updateOrderStatus,
    handleCreateProduct,
    setName,
    setPrice,
    setImage,
    setUnit,
    setQuantityAvailable,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editQuantity, setEditQuantity] = useState("");
    const [editUnit, setEditUnit] = useState("кг");

    const myProducts = products.filter(
        (product) => product.supplier_id === user?.id
    );

    const supplierOrders = orders.filter(
        (order) => order.supplier_id === user?.id
    );

    const totalProducts = myProducts.length;
    const totalOrders = supplierOrders.length;

    const totalRevenue = supplierOrders.reduce(
        (sum, order) => sum + Number(order.total_price),
        0
    );

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditQuantity(product.quantity_available);
        setEditUnit(product.unit);
    };

    const saveEdit = (product) => {
        updateProduct(product.id, {
            category_id: product.category_id,
            name: editName,
            description: product.description,
            price: editPrice,
            unit: editUnit,
            quantity_available: editQuantity,
            image_url: product.image_url,
        });

        setEditingId(null);
    };

    return (
        <div className="supplier-page">
            <section className="dashboard-hero">
                <div>
                    <span className="home-badge">Кабінет постачальника</span>

                    <h1>Керуйте товарами та замовленнями</h1>

                    <p>
                        Додавайте нові товари, оновлюйте залишки,
                        редагуйте ціни та обробляйте замовлення бізнес-клієнтів.
                    </p>
                </div>
            </section>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{totalProducts}</h3>
                    <p>Мої товари</p>
                </div>

                <div className="stat-card">
                    <h3>{totalOrders}</h3>
                    <p>Замовлення</p>
                </div>

                <div className="stat-card">
                    <h3>{totalRevenue} грн</h3>
                    <p>Загальна сума</p>
                </div>
            </div>

            <div className="form-card supplier-create-card">
                <h1>Додати товар</h1>

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

            <div className="cart-card supplier-section">
                <h3>Мої товари</h3>

                {myProducts.length === 0 ? (
                    <p className="empty-state">У вас ще немає товарів</p>
                ) : (
                    myProducts.map((product) => (
                        <div className="supplier-product-row" key={product.id}>
                            {editingId === product.id ? (
                                <div className="supplier-edit-grid">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />

                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                    />

                                    <input
                                        type="number"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                    />

                                    <select
                                        value={editUnit}
                                        onChange={(e) => setEditUnit(e.target.value)}
                                    >
                                        <option value="кг">кг</option>
                                        <option value="100 г">100 г</option>
                                        <option value="шт">шт</option>
                                        <option value="л">л</option>
                                        <option value="упаковка">упаковка</option>
                                    </select>

                                    <button onClick={() => saveEdit(product)}>
                                        Зберегти
                                    </button>

                                    <button onClick={() => setEditingId(null)}>
                                        Скасувати
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <strong>{product.name}</strong>
                                        <span>
                                            {product.quantity_available} {product.unit}
                                        </span>
                                    </div>

                                    <p>
                                        {product.price} грн / {product.unit}
                                    </p>

                                    <div className="cart-item-actions">
                                        <button onClick={() => startEdit(product)}>
                                            Редагувати
                                        </button>

                                        <button onClick={() => deleteProduct(product.id)}>
                                            Видалити
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="cart-card supplier-section">
                <h3>Замовлення на мої товари</h3>

                {supplierOrders.length === 0 ? (
                    <p className="empty-state">Замовлень поки немає</p>
                ) : (
                    supplierOrders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <h4>Замовлення #{order.id}</h4>

                                <span className={`status ${order.status}`}>
                                    {order.status}
                                </span>
                            </div>

                            <p>
                                <strong>Сума:</strong> {order.total_price} грн
                            </p>

                            <p>
                                <strong>Дата:</strong>{" "}
                                {new Date(order.created_at).toLocaleDateString()}
                            </p>

                            <div className="cart-item-actions">
                                <button
                                    onClick={() =>
                                        updateOrderStatus(order.id, "confirmed")
                                    }
                                >
                                    Підтвердити
                                </button>

                                <button
                                    onClick={() =>
                                        updateOrderStatus(order.id, "delivered")
                                    }
                                >
                                    Виконано
                                </button>

                                <button
                                    onClick={() =>
                                        updateOrderStatus(order.id, "cancelled")
                                    }
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SupplierDashboard;