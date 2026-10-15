-- ====================================================================
-- PostgreSQL Database & Tables Setup for Bike Rental System
-- ====================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    aadhaar_number VARCHAR(100),
    address TEXT,
    profile_photo TEXT,
    pan_card TEXT,
    aadhaar_doc TEXT,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    admin_verified BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS bikes (
    id SERIAL PRIMARY KEY,
    bike_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    price_per_day INTEGER NOT NULL,
    price_per_hour INTEGER DEFAULT 100,
    availability VARCHAR(50) DEFAULT 'Available',
    image_url TEXT,
    engine VARCHAR(100),
    torque VARCHAR(100),
    fuel_tank VARCHAR(100),
    mileage VARCHAR(100),
    plate_number VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    bike_name VARCHAR(255),
    booking_date VARCHAR(100),
    return_date VARCHAR(100),
    total_price INTEGER,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Confirmed',
    rental_type VARCHAR(50) DEFAULT 'daily',
    duration VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    cancelled_at VARCHAR(100),
    completed_at VARCHAR(100),
    updated_at VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_bookings_user_id ON bookings(user_id);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    bike_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    email VARCHAR(255),
    otp VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    created_at BIGINT,
    expires_at BIGINT
);

-- 2. Seed Initial Users
INSERT INTO users (name, email, password, role, is_verified, admin_verified)
VALUES 
('Admin User', 'admin@gmail.com', '$5$rounds=535000$vNGT0PlVGgA5VLWP$2SWqB0zH6e7EGQpi02Wi7qadS43Pwli13vKsOkvSrMB', 'admin', TRUE, TRUE),
('Client User', 'client@example.com', '$5$rounds=535000$FIb1S9JWr7rD7H6b$e6FubAfwASd5KXjEjVLj/iXNbq0wnPEaH9SqPMTXs45', 'user', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Initial Bikes
INSERT INTO bikes (bike_name, brand, model, price_per_day, price_per_hour, availability, image_url, engine, torque, fuel_tank, mileage, plate_number)
VALUES
('Royal Enfield Classic 350', 'Royal Enfield', '2023', 1200, 150, 'Available', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', '349cc', '27 Nm', '13 L', '35 kmpl', 'MH12AB1234'),
('Honda Activa 6G', 'Honda', '2023', 500, 50, 'Available', 'https://images.unsplash.com/photo-1629895237742-1262d29fdfac?q=80&w=800', '109cc', '8.9 Nm', '5.3 L', '50 kmpl', 'MH12XY5678'),
('KTM Duke 390', 'KTM', '2023', 1500, 250, 'Available', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800', '373cc', '37 Nm', '13.4 L', '25 kmpl', 'MH12YZ9012')
ON CONFLICT (plate_number) DO NOTHING;
