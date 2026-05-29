import { useMemo, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { NEXT_STATUSES, getStatusLabel } from "../utils/orderStatus";

function SupplierDashboard({
    products,
    user,
    orders,
    deleteProduct,
    updateProduct,
    updateOrderStatus,
    handleCreateProduct,
    categories,
    setName,
    setDescription,
    setPrice,
    setImage,
    setUnit,
    setQuantityAvailable,
    setCategoryId,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editQuantity, setEditQuantity] = useState("");
    const [editUnit, setEditUnit] = useState("кг");
    const [editImage, setEditImage] = useState(null);
    const [orderFilter, setOrderFilter] = useState("");
    const [confirmProductId, setConfirmProductId] = useState(null);

    const myProducts = products.filter(
        (product) => product.supplier_id === user?.id
    );

    const supplierOrders = orders.filter(
        (order) => order.supplier_id === user?.id
    );

    const filteredOrders = orderFilter
        ? supplierOrders.filter((order) => order.status === orderFilter)
        : supplierOrders;

    const stats = useMemo(() => {
        const confirmedOrders = supplierOrders.filter(
            (order) => order.status !== "cancelled"
        );

        return {
            totalProducts: myProducts.length,
            totalOrders: supplierOrders.length,
            totalRevenue: confirmedOrders.reduce(
                (sum, order) => sum + Number(order.total_price),
                0
            ),
            lowStock: myProducts.filter(
                (product) => Number(product.quantity_available) <= 5
            ).length,
        };
    }, [myProducts, supplierOrders]);

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditName(product.name);
        setEditDescription(product.description || "");
        setEditCategoryId(String(product.category_id || ""));
        setEditPrice(product.price);
        setEditQuantity(product.quantity_available);
        setEditUnit(product.unit);
        setEditImage(null);
    };

    const saveEdit = (product) => {
        const formData = new FormData();
        formData.append("category_id", editCategoryId);
        formData.append("name", editName);
        formData.append("description", editDescription);
        formData.append("price", editPrice);
        formData.append("unit", editUnit);
        formData.append("quantity_available", editQuantity);
        formData.append("image_url", product.image_url || "");

        if (editImage) {
            formData.append("image", editImage);
        }

        updateProduct(product.id, formData);
        setEditingId(null);
    };

    return (
        <div className="supplier-page">
            <section className="home-hero">
                <div>
                    <span className="home-badge">Кабінет постачальника</span>
                    <h1>Товари, залишки й замовлення</h1>
                    <p>
                        Керуйте каталогом, оновлюйте опис і категорії товарів, стежте за
                        залишками та обробляйте замовлення бізнес-клієнтів.
                    </p>
                </div>
            </section>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{stats.totalProducts}</h3>
                    <p>Мої товари</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.totalOrders}</h3>
                    <p>Замовлення</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.totalRevenue} грн</h3>
                    <p>Сума продажів</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.lowStock}</h3>
                    <p>Малий залишок</p>
                </div>
            </div>

            <div className="form-card supplier-create-card">
                <h1>Додати товар</h1>

                <form onSubmit={handleCreateProduct}>
                    <input
                        type="text"
                        placeholder="Назва товару"
                        onChange={(event) => setName(event.target.value)}
                    />

                    <textarea
                        placeholder="Опис товару"
                        onChange={(event) => setDescription(event.target.value)}
                    />

                    <select onChange={(event) => setCategoryId(event.target.value)}>
                        <option value="">Оберіть категорію</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Ціна"
                        onChange={(event) => setPrice(event.target.value)}
                    />

                    <select onChange={(event) => setUnit(event.target.value)}>
                        <option value="кг">за кг</option>
                        <option value="100 г">за 100 г</option>
                        <option value="шт">за штуку</option>
                        <option value="л">за літр</option>
                        <option value="упаковка">за упаковку</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Кількість в наявності"
                        onChange={(event) => setQuantityAvailable(event.target.value)}
                    />

                    <input
                        type="file"
                        onChange={(event) => setImage(event.target.files[0])}
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
                                        onChange={(event) => setEditName(event.target.value)}
                                    />
                                    <textarea
                                        value={editDescription}
                                        onChange={(event) => setEditDescription(event.target.value)}
                                    />
                                    <select
                                        value={editCategoryId}
                                        onChange={(event) => setEditCategoryId(event.target.value)}
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(event) => setEditPrice(event.target.value)}
                                    />
                                    <input
                                        type="number"
                                        value={editQuantity}
                                        onChange={(event) => setEditQuantity(event.target.value)}
                                    />
                                    <select
                                        value={editUnit}
                                        onChange={(event) => setEditUnit(event.target.value)}
                                    >
                                        <option value="кг">кг</option>
                                        <option value="100 г">100 г</option>
                                        <option value="шт">шт</option>
                                        <option value="л">л</option>
                                        <option value="упаковка">упаковка</option>
                                    </select>
                                    <input
                                        type="file"
                                        onChange={(event) => setEditImage(event.target.files[0])}
                                    />

                                    <button onClick={() => saveEdit(product)}>Зберегти</button>
                                    <button onClick={() => setEditingId(null)}>Скасувати</button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <strong>{product.name}</strong>
                                        <span>
                                            {product.category_name || "Без категорії"} ·{" "}
                                            {product.quantity_available} {product.unit}
                                        </span>
                                    </div>
                                    <p>{product.price} грн / {product.unit}</p>
                                    <div className="cart-item-actions">
                                        <button onClick={() => startEdit(product)}>
                                            Редагувати
                                        </button>
                                        <button
                                            className="danger-button"
                                            onClick={() => setConfirmProductId(product.id)}
                                        >
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
                <div className="panel-heading">
                    <span>Фільтр за статусом</span>
                    <h2>Замовлення</h2>
                </div>

                <div className="filters">
                    <select
                        value={orderFilter}
                        onChange={(event) => setOrderFilter(event.target.value)}
                    >
                        <option value="">Усі статуси</option>
                        <option value="new">Нові</option>
                        <option value="confirmed">Підтверджені</option>
                        <option value="delivered">Доставлені</option>
                        <option value="cancelled">Скасовані</option>
                    </select>
                </div>

                {filteredOrders.length === 0 ? (
                    <p className="empty-state">Замовлень поки немає</p>
                ) : (
                    filteredOrders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <h4>Замовлення #{order.id}</h4>
                                <span className={`status ${order.status}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <p><strong>Сума:</strong> {order.total_price} грн</p>
                            <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                            <p><strong>Доставка:</strong> {order.delivery_address || "Не вказано"}</p>

                            <div className="cart-item-actions">
                                {(NEXT_STATUSES[order.status] || []).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => updateOrderStatus(order.id, status)}
                                    >
                                        {getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {confirmProductId && (
                <ConfirmModal
                    title="Видалити товар?"
                    text="Товар зникне з каталогу, але історія замовлень залишиться."
                    confirmText="Видалити"
                    onConfirm={() => {
                        deleteProduct(confirmProductId);
                        setConfirmProductId(null);
                    }}
                    onCancel={() => setConfirmProductId(null)}
                />
            )}
        </div>
    );
}

export default SupplierDashboard;
