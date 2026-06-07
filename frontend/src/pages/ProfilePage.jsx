import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { getStatusLabel } from "../utils/orderStatus";
import { formatOrderNumber } from "../utils/orderNumber";
import { UKRAINE_REGIONS } from "../utils/regions";

function ProfilePage({ orders = [] }) {
    const { token, user, setUser } = useAuth();
    const isAdmin = user?.role === "admin";
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [region, setRegion] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCompanyName(user?.company_name || "");
        setPhone(user?.phone || "");
        setAddress(user?.address || "");
        setRegion(user?.region || "");
    }, [user]);

    const cancelEdit = () => {
        setCompanyName(user?.company_name || "");
        setPhone(user?.phone || "");
        setAddress(user?.address || "");
        setRegion(user?.region || "");
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const profilePayload = isAdmin
                ? { company_name: companyName }
                : {
                    company_name: companyName,
                    phone,
                    address,
                    region,
                };

            const response = await apiClient.put(
                "/api/users/profile",
                profilePayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUser(response.data.user);
            setIsEditing(false);
            toast.success("Профіль оновлено");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Не вдалося оновити профіль");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <section className="profile-panel">
                <div className="panel-heading profile-heading">
                    <div>
                        <span>{user?.role || "account"}</span>
                        <h2>{user?.company_name || "Мій профіль"}</h2>
                    </div>

                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)}>
                            Змінити
                        </button>
                    )}
                </div>

                <form className="profile-single-form" onSubmit={handleSubmit}>
                    <label>
                        Назва компанії
                        {isEditing ? (
                            <input
                                type="text"
                                value={companyName}
                                onChange={(event) => setCompanyName(event.target.value)}
                            />
                        ) : (
                            <strong>{user?.company_name || "Не вказано"}</strong>
                        )}
                    </label>

                    <label>
                        Email
                        <strong>{user?.email}</strong>
                    </label>

                    {isAdmin && (
                        <>
                            <label>
                                Роль
                                <strong>Адміністратор</strong>
                            </label>

                            <label className="wide-field">
                                Доступ
                                <strong>Користувачі, товари, категорії, замовлення та аудит</strong>
                            </label>
                        </>
                    )}

                    {!isAdmin && (
                    <label>
                        Телефон
                        {isEditing ? (
                            <input
                                type="tel"
                                value={phone}
                                placeholder="+380..."
                                onChange={(event) => setPhone(event.target.value)}
                            />
                        ) : (
                            <strong>{user?.phone || "Не вказано"}</strong>
                        )}
                    </label>
                    )}

                    {!isAdmin && (
                    <label className="wide-field">
                        Адреса доставки / складу
                        {isEditing ? (
                            <textarea
                                value={address}
                                placeholder="Місто, вулиця, будинок, деталі для кур'єра"
                                onChange={(event) => setAddress(event.target.value)}
                            />
                        ) : (
                            <strong>{user?.address || "Не вказано"}</strong>
                        )}
                    </label>
                    )}

                    {!isAdmin && (
                    <label>
                        {user?.role === "supplier" ? "Регіон роботи" : "Регіон доставки"}
                        {isEditing ? (
                            <select
                                value={region}
                                onChange={(event) => setRegion(event.target.value)}
                            >
                                <option value="">Оберіть регіон</option>
                                {UKRAINE_REGIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <strong>{user?.region || "Не вказано"}</strong>
                        )}
                    </label>
                    )}

                    {isEditing && (
                        <div className="profile-actions">
                            <button type="submit" disabled={isSaving}>
                                {isSaving ? "Збереження..." : "Зберегти"}
                            </button>
                            <button type="button" onClick={cancelEdit}>
                                Скасувати
                            </button>
                        </div>
                    )}
                </form>
            </section>

            {isAdmin ? (
            <section className="profile-panel">
                <div className="panel-heading">
                    <span>Службовий акаунт</span>
                    <h2>Адміністрування платформи</h2>
                </div>

                <div className="info-list">
                    <div>
                        <span>Призначення</span>
                        <strong>Керування користувачами, товарами, категоріями та замовленнями</strong>
                    </div>
                    <div>
                        <span>Доставка</span>
                        <strong>Не використовується для адміністратора</strong>
                    </div>
                    <div>
                        <span>Регіон</span>
                        <strong>Не потрібен для службового акаунта</strong>
                    </div>
                </div>
            </section>
            ) : (
            <section className="profile-panel">
                <div className="panel-heading">
                    <span>Історія</span>
                    <h2>Замовлення</h2>
                </div>

                {orders.length === 0 ? (
                    <p className="empty-state">Замовлень поки немає</p>
                ) : (
                    <div className="profile-orders">
                        {orders.map((order) => (
                            <Link
                                to={`/orders/${order.id}`}
                                className="profile-order-row"
                                key={order.id}
                            >
                                <strong>Замовлення {formatOrderNumber(order.id)}</strong>
                                <span>{getStatusLabel(order.status)}</span>
                                <span>{order.total_price} грн</span>
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
            )}
        </div>
    );
}

export default ProfilePage;
