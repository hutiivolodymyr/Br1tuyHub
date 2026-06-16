function Cart({
    cart,
    totalPrice,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    handleCheckout,
    deliveryPhone,
    setDeliveryPhone,
    deliveryAddress,
    setDeliveryAddress,
    deliveryComment,
    setDeliveryComment,
}) {
    const formatNumber = (value, maximumFractionDigits = 3) => {
        return Number(value).toLocaleString("uk-UA", {
            maximumFractionDigits,
        });
    };

    const formatMoney = (value) => {
        return Number(value).toLocaleString("uk-UA", {
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="cart-card">
            <h2>Кошик</h2>

            {cart.length === 0 ? (
                <p>Кошик порожній</p>
            ) : (
                <>
                    {cart.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <div className="cart-item-info">
                                <strong>{item.name}</strong>
                                <span>
                                    Доступно: {formatNumber(item.quantity_available)} {item.unit}
                                </span>
                            </div>

                            <div className="quantity-controls">
                                <button
                                    type="button"
                                    disabled={Number(item.quantity) <= 1}
                                    onClick={() => decreaseQuantity(item.id)}
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    min="1"
                                    max={Number(item.quantity_available) || undefined}
                                    step="0.1"
                                    value={item.quantity}
                                    onFocus={(event) => event.target.select()}
                                    onChange={(event) =>
                                        updateQuantity(item.id, event.target.value)
                                    }
                                />

                                <span>{item.unit}</span>

                                <button
                                    type="button"
                                    disabled={
                                        Number(item.quantity) >=
                                        Number(item.quantity_available)
                                    }
                                    onClick={() => increaseQuantity(item.id)}
                                >
                                    +
                                </button>
                            </div>

                            <span className="cart-item-total">
                                {formatMoney(Number(item.price) * Number(item.quantity))} грн
                            </span>

                            <button
                                type="button"
                                className="cart-item-remove"
                                onClick={() => removeFromCart(item.id)}
                            >
                                Видалити
                            </button>
                        </div>
                    ))}

                    <h3>Разом: {formatMoney(totalPrice)} грн</h3>

                    <div className="delivery-form">
                        <h3>Дані доставки</h3>

                        <input
                            type="tel"
                            placeholder="Телефон для доставки"
                            value={deliveryPhone}
                            onChange={(event) => setDeliveryPhone(event.target.value)}
                        />

                        <textarea
                            placeholder="Адреса доставки"
                            value={deliveryAddress}
                            onChange={(event) => setDeliveryAddress(event.target.value)}
                        />

                        <textarea
                            placeholder="Коментар до замовлення"
                            value={deliveryComment}
                            onChange={(event) => setDeliveryComment(event.target.value)}
                        />
                    </div>

                    <button type="button" onClick={handleCheckout}>
                        Оформити замовлення
                    </button>
                </>
            )}
        </div>
    );
}

export default Cart;
