import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function Navbar({ token, user, handleLogout }) {
    const { cart } = useCart();

    const cartCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <div className="navbar">
            <Link to="/" className="logo">
                Br1tuyHub
            </Link>

            <div className="nav-info">
                {user?.role === "business" && (
                    <>
                        <Link to="/business">Кабінет бізнесу</Link>
                        <Link to="/favorites">Обране</Link>

                        <Link to="/cart" className="cart-link">
                            🛒
                            {cartCount > 0 && (
                                <span className="cart-badge">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </>
                )}

                <Link to="/">Товари</Link>

                {token && <Link to="/orders">Замовлення</Link>}

                {user && (
                    <span>
                        {user.company_name} · {user.role}
                    </span>
                )}

                {token && (
                    <button onClick={handleLogout}>
                        Вийти
                    </button>
                )}
            </div>

            {user?.role === "supplier" && (
                <Link to="/supplier">
                    Кабінет постачальника
                </Link>
            )}
        </div>
    );
}

export default Navbar;