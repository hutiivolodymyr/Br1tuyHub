import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

function ProfilePage() {
    const { token, user, setUser } = useAuth();
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCompanyName(user?.company_name || "");
        setPhone(user?.phone || "");
        setAddress(user?.address || "");
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const response = await apiClient.put(
                "/api/users/profile",
                {
                    company_name: companyName,
                    phone,
                    address,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUser(response.data.user);
            toast.success("Профіль оновлено");
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося оновити профіль");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <section className="home-hero profile-hero">
                <div>
                    <span className="home-badge">
                        {user?.role === "supplier"
                            ? "Профіль постачальника"
                            : user?.role === "admin"
                              ? "Профіль адміністратора"
                              : "Профіль бізнесу"}
                    </span>

                    <h1>{user?.company_name || "Мій профіль"}</h1>

                    <p>
                        Збережіть контактний номер і адресу. Бізнес використовує ці дані
                        для доставки під час оформлення замовлення.
                    </p>
                </div>

                <div className="home-hero-cards">
                    <div>
                        <strong>{user?.role || "-"}</strong>
                        <span>Роль</span>
                    </div>

                    <div>
                        <strong>{user?.is_blocked ? "Так" : "Ні"}</strong>
                        <span>Заблокований</span>
                    </div>
                </div>
            </section>

            <div className="profile-grid">
                <form className="profile-card" onSubmit={handleSubmit}>
                    <div className="panel-heading">
                        <span>Контакти</span>
                        <h2>Дані компанії</h2>
                    </div>

                    <label>
                        Назва компанії
                        <input
                            type="text"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                        />
                    </label>

                    <label>
                        Телефон
                        <input
                            type="tel"
                            value={phone}
                            placeholder="+380..."
                            onChange={(event) => setPhone(event.target.value)}
                        />
                    </label>

                    <label>
                        Адреса доставки / складу
                        <textarea
                            value={address}
                            placeholder="Місто, вулиця, будинок, деталі для кур'єра"
                            onChange={(event) => setAddress(event.target.value)}
                        />
                    </label>

                    <button type="submit" disabled={isSaving}>
                        {isSaving ? "Збереження..." : "Зберегти профіль"}
                    </button>
                </form>

                <aside className="profile-card profile-summary">
                    <div className="panel-heading">
                        <span>Акаунт</span>
                        <h2>Основна інформація</h2>
                    </div>

                    <div className="info-list">
                        <div>
                            <span>Email</span>
                            <strong>{user?.email}</strong>
                        </div>

                        <div>
                            <span>Телефон</span>
                            <strong>{user?.phone || "Не вказано"}</strong>
                        </div>

                        <div>
                            <span>Адреса</span>
                            <strong>{user?.address || "Не вказано"}</strong>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ProfilePage;
