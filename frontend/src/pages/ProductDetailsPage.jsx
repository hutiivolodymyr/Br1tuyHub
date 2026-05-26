import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

function ProductDetailsPage() {
    const { id } = useParams();

    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/products/${id}`
            );

            setProduct(response.data.product);

            const relatedResponse = await axios.get(
                "http://localhost:5000/api/products"
            );

            const filtered = relatedResponse.data.products
                .filter((p) => p.id !== response.data.product.id)
                .slice(0, 4);

            setRelatedProducts(filtered);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    if (!product) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <div className="product-details">
                {product.image_url && (
                    <img
                        src={`http://localhost:5000${product.image_url}`}
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
                                    src={`http://localhost:5000${item.image_url}`}
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