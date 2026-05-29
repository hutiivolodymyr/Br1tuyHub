import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const navClassName = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

function Navbar({ token, user, handleLogout }) {
    const { cart } = useCart();

    const cartCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <header className="navbar">
            <Link to="/" className="logo">
                Br1tuyHub
            </Link>

            <nav className="nav-info" aria-label="Основна навігація">
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

                        <NavLink to="/cart" className="cart-link" aria-label="Кошик">
                            <span>Кошик</span>
                            {cartCount > 0 && (
                                <strong className="cart-badge">
                                    {cartCount}
                                </strong>
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
                        Адмін
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

            {user && (
                <div className="nav-account">
                    <span>{user.company_name}</span>
                    <strong>{user.role}</strong>
                </div>
            )}

            {token && (
                <button className="logout-button" onClick={handleLogout}>
                    Вийти
                </button>
            )}
        </header>
    );
}

export default Navbar;
