import { Link } from "react-router-dom";
import { getStatusLabel } from "../utils/orderStatus";

function BusinessDashboard({ orders }) {
    const activeOrders = orders.filter(
        (order) => !["delivered", "cancelled"].includes(order.status)
    );
    const totalSpent = orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.total_price), 0);
    const suppliers = new Set(orders.map((order) => order.supplier_id));

    return (
        <div>
            <section className="home-hero">
                <div>
                    <span className="home-badge">Кабінет бізнесу</span>
                    <h1>Закупівлі та доставки</h1>
                    <p>
                        Відстежуйте витрати, активні замовлення, статуси доставки та
                        останні закупівлі.
                    </p>
                </div>
            </section>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{totalSpent} грн</h3>
                    <p>Витрачено</p>
                </div>
                <div className="stat-card">
                    <h3>{activeOrders.length}</h3>
                    <p>Активні замовлення</p>
                </div>
                <div className="stat-card">
                    <h3>{suppliers.size}</h3>
                    <p>Постачальники</p>
                </div>
            </div>

            <div className="cart-card">
                <h3>Останні замовлення</h3>

                {orders.length === 0 ? (
                    <p>Замовлень поки немає</p>
                ) : (
                    orders.slice(0, 8).map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <Link to={`/orders/${order.id}`}>
                                    <h4>Замовлення #{order.id}</h4>
                                </Link>

                                <span className={`status ${order.status}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <p><strong>Сума:</strong> {order.total_price} грн</p>
                            <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                            <p><strong>Доставка:</strong> {order.delivery_address || "Адресу не вказано"}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BusinessDashboard;
