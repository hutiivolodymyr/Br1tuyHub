import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";
import { getStatusLabel } from "../utils/orderStatus";

function OrderDetailsPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await apiClient.get(`/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrder(response.data.order);
            setItems(response.data.items);
        } catch (error) {
            console.error(error);
        }
    }, [id, token]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    if (!order) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="cart-card">
                <div className="panel-heading">
                    <span className={`status ${order.status}`}>
                        {getStatusLabel(order.status)}
                    </span>
                    <h2>Замовлення #{order.id}</h2>
                </div>

                <div className="details-grid">
                    <div>
                        <span>Бізнес</span>
                        <strong>{order.business_name || "-"}</strong>
                        <p>{order.business_email || ""}</p>
                        <p>{order.business_phone || ""}</p>
                    </div>
                    <div>
                        <span>Постачальник</span>
                        <strong>{order.supplier_name || "-"}</strong>
                        <p>{order.supplier_email || ""}</p>
                        <p>{order.supplier_phone || ""}</p>
                    </div>
                    <div>
                        <span>Доставка</span>
                        <strong>{order.delivery_phone || "Телефон не вказано"}</strong>
                        <p>{order.delivery_address || "Адресу не вказано"}</p>
                        <p>{order.delivery_comment || ""}</p>
                    </div>
                    <div>
                        <span>Сума</span>
                        <strong>{order.total_price} грн</strong>
                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        {order.pdf_url && (
                            <a href={`http://localhost:5000${order.pdf_url}`} target="_blank" rel="noreferrer">
                                Відкрити рахунок PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="cart-card">
                <h3>Товари</h3>

                {items.map((item) => (
                    <div className="cart-item" key={item.id}>
                        <span>{item.name}</span>
                        <span>{item.quantity} x {item.price} грн</span>
                        <span>{item.subtotal} грн</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderDetailsPage;
