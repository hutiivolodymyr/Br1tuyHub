-- Br1tuyHub database schema
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    region VARCHAR(120),
    role VARCHAR(20) NOT NULL DEFAULT 'business',
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check
        CHECK (role IN ('business', 'supplier', 'admin'))
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_available NUMERIC(12, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_price_check CHECK (price > 0),
    CONSTRAINT products_quantity_check CHECK (quantity_available >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    pdf_url TEXT,
    delivery_phone VARCHAR(50),
    delivery_address TEXT,
    delivery_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_status_check
        CHECK (status IN ('new', 'confirmed', 'delivered', 'cancelled')),
    CONSTRAINT orders_total_price_check CHECK (total_price >= 0)
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT order_items_price_check CHECK (price >= 0),
    CONSTRAINT order_items_subtotal_check CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id INTEGER,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS products_supplier_id_idx ON products(supplier_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS users_region_idx ON users(region);
CREATE INDEX IF NOT EXISTS orders_business_id_idx ON orders(business_id);
CREATE INDEX IF NOT EXISTS orders_supplier_id_idx ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS audit_logs_admin_id_idx ON audit_logs(admin_id);

INSERT INTO categories (name)
VALUES
    ('Фрукти'),
    ('Овочі'),
    ('Молочні продукти'),
    ('М''ясо'),
    ('Напої'),
    ('Бакалія')
ON CONFLICT (name) DO NOTHING;
