import { Link } from "react-router-dom";

function Navbar({ token, user, handleLogout }) {
    return (
        <div className="navbar">
            <Link to="/" className="logo">
                Br1tuyHub
            </Link>

            <div className="nav-info">
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
        </div>
    );
}

export default Navbar;  