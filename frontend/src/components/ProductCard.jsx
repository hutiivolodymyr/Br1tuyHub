import { Link } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";

function ProductCard({ product, user, addToCart }) {
    const { toggleFavorite, isFavorite } = useFavorites();

    return (
        <div className="product-card">
            <button
                className="favorite-icon"
                onClick={() => toggleFavorite(product)}
            >
                {isFavorite(product.id) ? "❤️" : "🤍"}
            </button>

            {product.image_url && (
                <img
                    src={`http://localhost:5000${product.image_url}`}
                    alt={product.name}
                />
            )}

            <div className="product-info">
                <Link to={`/products/${product.id}`}>
                    <h3>{product.name}</h3>
                </Link>

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