-- Sample Export: E-Commerce Store Schema
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_inv_cust FOREIGN KEY (customer_id) REFERENCES customers(id)
);

