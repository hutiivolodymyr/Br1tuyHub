function BusinessDashboard({ orders }) {
    return (
        <div>
            <h2>Кабінет бізнесу</h2>

            <div className="cart-card">
                <h3>Мої замовлення</h3>

                {orders.length === 0 ? (
                    <p>Замовлень поки немає</p>
                ) : (
                    orders.map((order) => (
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
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BusinessDashboard;