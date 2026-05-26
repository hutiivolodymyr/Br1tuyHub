import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";

function FavoritesPage() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { favorites } = useFavorites();

    return (
        <div>
            <h2>Обране</h2>

            {favorites.length === 0 ? (
                <div className="cart-card empty-state">
                    <p>У вас поки немає обраних товарів</p>
                </div>
            ) : (
                <div className="products-grid">
                    {favorites.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            user={user}
                            addToCart={addToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;