import { Link } from "react-router-dom";
import { ORDER_STATUSES, getStatusLabel } from "../utils/orderStatus";
import { formatOrderNumber } from "../utils/orderNumber";

function OrdersPage({
    orders,
    statusFilter,
    setStatusFilter,
    orderPage,
    setOrderPage,
}) {
    return (
        <div className="cart-card">
            <div className="panel-heading">
                <span>Історія та статуси</span>
                <h2>Мої замовлення</h2>
            </div>

            <div className="filters">
                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setOrderPage(1);
                    }}
                >
                    <option value="">Усі статуси</option>
                    {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            {orders.length === 0 ? (
                <p>Замовлень поки немає</p>
            ) : (
                orders.map((order) => (
                    <div className="cart-item" key={order.id}>
                        <Link to={`/orders/${order.id}`}>
                            Замовлення {formatOrderNumber(order.id)}
                        </Link>
                        <span>{order.total_price} грн</span>
                        <span className={`status ${order.status}`}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                ))
            )}

            <div className="pagination-bar">
                <button
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage(orderPage - 1)}
                >
                    Назад
                </button>

                <span>Сторінка {orderPage}</span>

                <button
                    disabled={orders.length < 10}
                    onClick={() => setOrderPage(orderPage + 1)}
                >
                    Далі
                </button>
            </div>
        </div>
    );
}

export default OrdersPage;
