import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import EmptyState from "../components/EmptyState";

function FavoritesPage() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { favorites } = useFavorites();

    return (
        <div>
            <h2>Обране</h2>

            {favorites.length === 0 ? (
<EmptyState
    title="Немає обраних товарів"
    text="Додавайте товари в обране ❤️"
/>
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