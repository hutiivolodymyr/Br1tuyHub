import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const navClassName = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

function Navbar({ token, user, handleLogout }) {
    const { cart } = useCart();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <aside className="sidebar">
                <Link to="/" className="sidebar-logo">
                    Br1tuyHub
                </Link>

                <nav className="sidebar-nav" aria-label="Основна навігація">
                    <NavLink to="/" className={navClassName} end>
                        Товари
                    </NavLink>

                    {user?.role === "business" && (
                        <>
                            <NavLink to="/business" className={navClassName}>
                                Кабінет бізнесу
                            </NavLink>

                            <NavLink to="/favorites" className={navClassName}>
                                Обране
                            </NavLink>

                            <NavLink to="/cart" className={navClassName}>
                                Кошик
                                {cartCount > 0 && (
                                    <span className="sidebar-badge">{cartCount}</span>
                                )}
                            </NavLink>
                        </>
                    )}

                    {user?.role === "supplier" && (
                        <NavLink to="/supplier" className={navClassName}>
                            Кабінет постачальника
                        </NavLink>
                    )}

                    {user?.role === "admin" && (
                        <NavLink to="/admin" className={navClassName}>
                            Адмін-панель
                        </NavLink>
                    )}

                    {token && (
                        <>
                            <NavLink to="/orders" className={navClassName}>
                                Замовлення
                            </NavLink>

                            <NavLink to="/profile" className={navClassName}>
                                Профіль
                            </NavLink>
                        </>
                    )}
                </nav>

                {token && (
                    <button className="sidebar-logout" onClick={handleLogout}>
                        Вийти
                    </button>
                )}
            </aside>

            <header className="dashboard-topbar">
                <div>
                    <span>{user?.role || "account"}</span>
                    <strong>{user?.company_name || "Br1tuyHub"}</strong>
                </div>
            </header>
        </>
    );
}

export default Navbar;
