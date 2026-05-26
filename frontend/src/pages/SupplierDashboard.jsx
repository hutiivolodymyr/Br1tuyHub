import { useState } from "react";

function SupplierDashboard({
    products,
    user,
    orders,
    deleteProduct,
    updateProduct,
    updateOrderStatus,
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
        <div>
            <h2>Кабінет постачальника</h2>

            <div className="cart-card">
                <h3>Мої товари</h3>

                {myProducts.length === 0 ? (
                    <p>У вас ще немає товарів</p>
                ) : (
                    myProducts.map((product) => (
                        <div className="cart-item" key={product.id}>
                            {editingId === product.id ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <span>{product.name}</span>
                                    <span>{product.price} грн / {product.unit}</span>
                                    <span>
                                        {product.quantity_available} {product.unit}
                                    </span>

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
            <div className="cart-card">
    <h3>Замовлення на мої товари</h3>

    {supplierOrders.length === 0 ? (
        <p>Замовлень поки немає</p>
    ) : (
        supplierOrders.map((order) => (
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
            <button onClick={() => updateOrderStatus(order.id, "confirmed")}>
                Підтвердити
            </button>

            <button onClick={() => updateOrderStatus(order.id, "delivered")}>
                Виконано
            </button>

            <button onClick={() => updateOrderStatus(order.id, "cancelled")}>
                Скасувати
            </button>
        </div>
    </div>
))

        ))
    )}
</div>
        </div>
    );
}

export default SupplierDashboard;