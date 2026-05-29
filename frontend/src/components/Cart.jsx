function Cart({
    cart,
    totalPrice,
    removeFromCart,
    handleCheckout,
    deliveryPhone,
    setDeliveryPhone,
    deliveryAddress,
    setDeliveryAddress,
    deliveryComment,
    setDeliveryComment,
}) {
    return (
        <div className="cart-card">
            <h2>Кошик</h2>

            {cart.length === 0 ? (
                <p>Кошик порожній</p>
            ) : (
                <>
                    {cart.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <span>
                                {item.name} x {item.quantity}
                            </span>

                            <span>
                                {Number(item.price) * item.quantity} грн
                            </span>

                            <button onClick={() => removeFromCart(item.id)}>
                                Видалити
                            </button>
                        </div>
                    ))}

                    <h3>Разом: {totalPrice} грн</h3>

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

                    <button onClick={handleCheckout}>
                        Оформити замовлення
                    </button>
                </>
            )}
        </div>
    );
}

export default Cart;
