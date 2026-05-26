function ProductCard({ product, user, addToCart }) {
    return (
        <div className="product-card">
            {product.image_url && (
                <img
                    src={`http://localhost:5000${product.image_url}`}
                    alt={product.name}
                />
            )}

            <div className="product-info">
                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <p className="price">
                    {product.price} грн / {product.unit}
                </p>

                {user?.role === "business" && (
                    <button onClick={() => addToCart(product)}>
                        Додати в кошик
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProductCard;