import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import { NEXT_STATUSES, getStatusLabel } from "../utils/orderStatus";

function AdminDashboard() {
    const { token, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [confirmAction, setConfirmAction] = useState(null);
    const [categoryName, setCategoryName] = useState("");

    const authHeaders = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
        }),
        [token]
    );

    const fetchAdminData = useCallback(async () => {
        try {
            const [
                usersResponse,
                ordersResponse,
                productsResponse,
                categoriesResponse,
                logsResponse,
            ] = await Promise.all([
                apiClient.get("/api/admin/users", { headers: authHeaders }),
                apiClient.get("/api/admin/orders", { headers: authHeaders }),
                apiClient.get("/api/admin/products", { headers: authHeaders }),
                apiClient.get("/api/categories"),
                apiClient.get("/api/admin/audit-logs", { headers: authHeaders }),
            ]);

            setUsers(usersResponse.data.users);
            setOrders(ordersResponse.data.orders);
            setProducts(productsResponse.data.products);
            setCategories(categoriesResponse.data.categories);
            setLogs(logsResponse.data.logs);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Не вдалося завантажити адмін-панель");
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const runAction = async (action, successMessage) => {
        try {
            await action();
            toast.success(successMessage);
            fetchAdminData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Дію не виконано");
        }
    };

    const createCategory = async (event) => {
        event.preventDefault();
        await runAction(
            () => apiClient.post("/api/categories", { name: categoryName }, { headers: authHeaders }),
            "Категорію створено"
        );
        setCategoryName("");
    };

    const stats = {
        users: users.length,
        orders: orders.length,
        products: products.length,
        revenue: orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    };

    return (
        <div className="admin-page">
            <section className="home-hero admin-hero">
                <div>
                    <span className="home-badge">Адмін-панель</span>
                    <h1>Керування Br1tuyHub</h1>
                    <p>
                        Користувачі, товари, категорії, замовлення та журнал дій в
                        одному місці.
                    </p>
                </div>
            </section>

            <div className="stats-grid">
                <div className="stat-card"><h3>{stats.users}</h3><p>Акаунтів</p></div>
                <div className="stat-card"><h3>{stats.orders}</h3><p>Замовлень</p></div>
                <div className="stat-card"><h3>{stats.products}</h3><p>Товарів</p></div>
                <div className="stat-card"><h3>{stats.revenue} грн</h3><p>Сума</p></div>
            </div>

            <div className="admin-tabs">
                {["users", "orders", "products", "categories", "logs"].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={activeTab === tab ? "active" : ""}
                        onClick={() => setActiveTab(tab)}
                    >
                        {{
                            users: "Користувачі",
                            orders: "Замовлення",
                            products: "Товари",
                            categories: "Категорії",
                            logs: "Аудит",
                        }[tab]}
                    </button>
                ))}
            </div>

            {activeTab === "users" && (
                <div className="admin-table-card">
                    <div className="panel-heading">
                        <span>{user?.email}</span>
                        <h2>Користувачі</h2>
                    </div>
                    <div className="admin-list">
                        {users.map((item) => (
                            <div className="admin-row" key={item.id}>
                                <div><strong>{item.company_name}</strong><span>{item.email}</span></div>
                                <div><span className={`status ${item.is_blocked ? "cancelled" : "confirmed"}`}>{item.is_blocked ? "blocked" : item.role}</span></div>
                                <div className="admin-row-meta">
                                    <span>{item.phone || "Без телефону"}</span>
                                    <span>{item.address || "Без адреси"}</span>
                                </div>
                                <div className="cart-item-actions">
                                    {item.id !== user?.id && (
                                        <>
                                            {item.is_blocked ? (
                                                <button onClick={() => runAction(
                                                    () => apiClient.put(`/api/admin/users/${item.id}/unblock`, null, { headers: authHeaders }),
                                                    "Користувача розблоковано"
                                                )}>Розблокувати</button>
                                            ) : (
                                                <button onClick={() => runAction(
                                                    () => apiClient.put(`/api/admin/users/${item.id}/block`, null, { headers: authHeaders }),
                                                    "Користувача заблоковано"
                                                )}>Заблокувати</button>
                                            )}
                                            <button
                                                className="danger-button"
                                                onClick={() => setConfirmAction({
                                                    title: "Видалити користувача?",
                                                    text: "Будуть видалені його товари й замовлення.",
                                                    onConfirm: () => runAction(
                                                        () => apiClient.delete(`/api/admin/users/${item.id}`, { headers: authHeaders }),
                                                        "Користувача видалено"
                                                    ),
                                                })}
                                            >Видалити</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "orders" && (
                <div className="admin-table-card">
                    <div className="panel-heading"><span>Операції</span><h2>Замовлення</h2></div>
                    <div className="admin-list">
                        {orders.map((order) => (
                            <div className="admin-row admin-order-row" key={order.id}>
                                <div><strong>Замовлення #{order.id}</strong><span>{order.business_name || "Бізнес"} {"->"} {order.supplier_name || "Постачальник"}</span></div>
                                <div><span className={`status ${order.status}`}>{getStatusLabel(order.status)}</span></div>
                                <div className="admin-row-meta">
                                    <span>{order.total_price} грн</span>
                                    <span>{order.delivery_address || "Адресу не вказано"}</span>
                                    <span>{order.delivery_phone || "Телефон не вказано"}</span>
                                </div>
                                <div className="cart-item-actions">
                                    {(NEXT_STATUSES[order.status] || []).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => runAction(
                                                () => apiClient.put(`/api/orders/${order.id}/status`, { status }, { headers: authHeaders }),
                                                "Статус замовлення оновлено"
                                            )}
                                        >
                                            {getStatusLabel(status)}
                                        </button>
                                    ))}
                                    <button
                                        className="danger-button"
                                        onClick={() => setConfirmAction({
                                            title: "Видалити замовлення?",
                                            text: "Якщо замовлення не скасоване, залишки товарів повернуться на склад.",
                                            onConfirm: () => runAction(
                                                () => apiClient.delete(`/api/admin/orders/${order.id}`, { headers: authHeaders }),
                                                "Замовлення видалено"
                                            ),
                                        })}
                                    >Видалити</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "products" && (
                <div className="admin-table-card">
                    <div className="panel-heading"><span>Каталог</span><h2>Товари</h2></div>
                    <div className="admin-list">
                        {products.map((product) => (
                            <div className="admin-row" key={product.id}>
                                <div><strong>{product.name}</strong><span>{product.supplier_name || "Без постачальника"}</span></div>
                                <div><span className={`status ${product.is_active ? "confirmed" : "cancelled"}`}>{product.is_active ? "active" : "hidden"}</span></div>
                                <div className="admin-row-meta">
                                    <span>{product.category_name || "Без категорії"}</span>
                                    <span>{product.price} грн / {product.unit}</span>
                                    <span>Залишок: {product.quantity_available}</span>
                                </div>
                                <div className="cart-item-actions">
                                    <button
                                        className="danger-button"
                                        onClick={() => setConfirmAction({
                                            title: "Видалити товар?",
                                            text: "Товар буде приховано з каталогу.",
                                            onConfirm: () => runAction(
                                                () => apiClient.delete(`/api/products/${product.id}`, { headers: authHeaders }),
                                                "Товар видалено"
                                            ),
                                        })}
                                    >Видалити</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "categories" && (
                <div className="admin-table-card">
                    <div className="panel-heading"><span>Каталог</span><h2>Категорії</h2></div>
                    <form className="inline-form" onSubmit={createCategory}>
                        <input
                            value={categoryName}
                            placeholder="Нова категорія"
                            onChange={(event) => setCategoryName(event.target.value)}
                        />
                        <button type="submit">Додати</button>
                    </form>
                    <div className="admin-list">
                        {categories.map((category) => (
                            <div className="admin-row compact-row" key={category.id}>
                                <div><strong>{category.name}</strong><span>ID: {category.id}</span></div>
                                <div className="cart-item-actions">
                                    <button
                                        className="danger-button"
                                        onClick={() => setConfirmAction({
                                            title: "Видалити категорію?",
                                            text: "Категорію можна видалити тільки якщо в ній немає товарів.",
                                            onConfirm: () => runAction(
                                                () => apiClient.delete(`/api/categories/${category.id}`, { headers: authHeaders }),
                                                "Категорію видалено"
                                            ),
                                        })}
                                    >Видалити</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "logs" && (
                <div className="admin-table-card">
                    <div className="panel-heading"><span>Останні 100 дій</span><h2>Аудит</h2></div>
                    <div className="admin-list">
                        {logs.map((log) => (
                            <div className="admin-row compact-row" key={log.id}>
                                <div><strong>{log.action} {log.entity_type}</strong><span>{log.admin_email || "system"}</span></div>
                                <div className="admin-row-meta">
                                    <span>ID: {log.entity_id || "-"}</span>
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {confirmAction && (
                <ConfirmModal
                    title={confirmAction.title}
                    text={confirmAction.text}
                    confirmText="Підтвердити"
                    onConfirm={() => {
                        confirmAction.onConfirm();
                        setConfirmAction(null);
                    }}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
