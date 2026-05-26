function Cart({
    cart,
    totalPrice,
    removeFromCart,
    handleCheckout,
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
                                {item.name} × {item.quantity}
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

                    <button onClick={handleCheckout}>
                        Оформити замовлення
                    </button>
                </>
            )}
        </div>
    );
}

export default Cart;