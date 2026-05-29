import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import apiClient, { getImageUrl } from "../api/client";

function ProductDetailsPage() {
    const { id } = useParams();

    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await apiClient.get(`/api/products/${id}`);

            setProduct(response.data.product);

            const relatedResponse = await apiClient.get("/api/products");

            const filtered = relatedResponse.data.products
                .filter((p) => p.id !== response.data.product.id)
                .slice(0, 4);

            setRelatedProducts(filtered);
        } catch (error) {
            console.error(error);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

if (!product) {
    return <Loader />;
}

    return (
        <>
            <div className="product-details">
                {product.image_url && (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                    />
                )}

                <div className="product-details-info">
                    <h2>{product.name}</h2>

                    <p>{product.description}</p>

                    <h3>
                        {product.price} грн / {product.unit}
                    </h3>

                    <p>
                        <strong>В наявності:</strong>{" "}
                        {product.quantity_available} {product.unit}
                    </p>

                    <p>
                        <strong>Постачальник:</strong>{" "}
                        {product.supplier_name}
                    </p>

                    {user?.role === "business" && (
                        <button onClick={() => addToCart(product)}>
                            Додати в кошик
                        </button>
                    )}
                </div>
            </div>

            <div className="related-section">
                <h3>Схожі товари</h3>

                <div className="products-grid">
                    {relatedProducts.map((item) => (
                        <div className="product-card" key={item.id}>
                            {item.image_url && (
                                <img
                                    src={getImageUrl(item.image_url)}
                                    alt={item.name}
                                />
                            )}

                            <div className="product-info">
                                <Link to={`/products/${item.id}`}>
                                    <h3>{item.name}</h3>
                                </Link>

                                <p>
                                    {item.price} грн / {item.unit}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default ProductDetailsPage;
