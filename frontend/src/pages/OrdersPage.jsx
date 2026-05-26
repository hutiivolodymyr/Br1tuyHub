import { Link } from "react-router-dom";
function OrdersPage({ orders }) {
    return (
        <div className="cart-card">
            <h2>Мої замовлення</h2>

            {orders.length === 0 ? (
                <p>Замовлень поки немає</p>
            ) : (
                orders.map((order) => (
                    <div className="cart-item" key={order.id}>
                        <Link to={`/orders/${order.id}`}>
    Замовлення #{order.id}
</Link>
                        <span>{order.total_price} грн</span>
                        <span>{order.status}</span>
                    </div>
                ))
            )}
        </div>
    );
}

export default OrdersPage;