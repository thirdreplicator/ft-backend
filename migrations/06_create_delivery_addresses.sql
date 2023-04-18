CREATE TABLE IF NOT EXISTS delivery_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  street VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  zip VARCHAR(10) NULL,
  use_as_primary BOOLEAN DEFAULT FALSE,
  special_instructions TEXT NULL,
  deleted_at BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES "users"(id)
);

-- INSERT INTO delivery_addresses (user_id, recipient,  phone, street, city, province, barangay, zip, special_instructions, use_as_primary)
-- VALUES (108, 'David Beckwith', '+63-912-345-6789', 'Palm Street', 'Dumaguete City', 'Negros Oriental', 'Daro', '6200', 'Please call when you reach Palm St.', true);
