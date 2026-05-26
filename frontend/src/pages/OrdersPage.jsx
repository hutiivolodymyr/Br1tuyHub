function OrdersPage({ orders }) {
    return (
        <div className="cart-card">
            <h2>Мої замовлення</h2>

            {orders.length === 0 ? (
                <p>Замовлень поки немає</p>
            ) : (
                orders.map((order) => (
                    <div className="cart-item" key={order.id}>
                        <span>Замовлення #{order.id}</span>
                        <span>{order.total_price} грн</span>
                        <span>{order.status}</span>
                    </div>
                ))
            )}
        </div>
    );
}

export default OrdersPage;