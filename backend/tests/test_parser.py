import unittest
from app.parser.sql_parser import SQLParser
from app.models.schema_models import CardinalityType

SAMPLE_SQL = """
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (order_id, product_id)
);

ALTER TABLE order_items ADD CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id);
"""

class TestSQLParser(unittest.TestCase):

    def setUp(self):
        self.parser = SQLParser()

    def test_parse_tables(self):
        schema = self.parser.parse(SAMPLE_SQL)
        table_names = [t.name.lower() for t in schema.tables]
        self.assertIn("users", table_names)
        self.assertIn("orders", table_names)
        self.assertIn("order_items", table_names)

    def test_columns_and_keys(self):
        schema = self.parser.parse(SAMPLE_SQL)
        users_table = next(t for t in schema.tables if t.name.lower() == "users")
        self.assertTrue(any(c.is_primary_key for c in users_table.columns if c.name == "id"))

        orders_table = next(t for t in schema.tables if t.name.lower() == "orders")
        user_id_col = next(c for c in orders_table.columns if c.name == "user_id")
        self.assertTrue(user_id_col.is_foreign_key)
        self.assertEqual(user_id_col.references_table.lower(), "users")

    def test_relationships(self):
        schema = self.parser.parse(SAMPLE_SQL)
        self.assertGreaterEqual(len(schema.relationships), 2)
        rel = next(r for r in schema.relationships if r.source_table == "orders" and r.target_table == "users")
        self.assertEqual(rel.source_column, "user_id")
        self.assertEqual(rel.target_column, "id")
        self.assertEqual(rel.on_delete, "CASCADE")

if __name__ == "__main__":
    unittest.main()

