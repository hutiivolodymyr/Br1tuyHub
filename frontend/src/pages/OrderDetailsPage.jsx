import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

function OrderDetailsPage() {
    const { id } = useParams();

    const { token } = useAuth();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);

    const fetchOrder = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOrder(response.data.order);
            setItems(response.data.items);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, []);

    if (!order) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="cart-card">
                <h2>Замовлення #{order.id}</h2>

                <p>
                    <strong>Статус:</strong> {order.status}
                </p>

                <p>
                    <strong>Сума:</strong> {order.total_price} грн
                </p>

                <p>
                    <strong>Дата:</strong>{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                </p>
            </div>

            <div className="cart-card">
                <h3>Товари</h3>

                {items.map((item) => (
                    <div className="cart-item" key={item.id}>
                        <span>{item.name}</span>

                        <span>
                            {item.quantity} × {item.price} грн
                        </span>

                        <span>
                            {item.subtotal} грн
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderDetailsPage;