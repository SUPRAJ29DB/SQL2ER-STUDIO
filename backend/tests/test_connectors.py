import unittest
import sqlite3
import os
import tempfile
from app.connectors.sqlite import SQLiteConnector

class TestSQLiteConnector(unittest.TestCase):

    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        
        # Populate test db
        conn = sqlite3.connect(self.temp_db.name)
        cur = conn.cursor()
        cur.execute("CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);")
        cur.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER, FOREIGN KEY(author_id) REFERENCES authors(id));")
        cur.execute("INSERT INTO authors VALUES (1, 'Jane Austen');")
        cur.execute("INSERT INTO books VALUES (101, 'Pride and Prejudice', 1);")
        conn.commit()
        conn.close()

    def tearDown(self):
        if os.path.exists(self.temp_db.name):
            os.remove(self.temp_db.name)

    def test_sqlite_reflection(self):
        connector = SQLiteConnector(self.temp_db.name)
        self.assertTrue(connector.test_connection())

        tables = connector.get_tables()
        self.assertIn("authors", tables)
        self.assertIn("books", tables)

        schema = connector.extract_schema()
        self.assertEqual(len(schema.tables), 2)
        self.assertGreaterEqual(len(schema.relationships), 1)

        # Test Query Execution
        query_res = connector.execute_query("SELECT title FROM books WHERE author_id = 1;")
        self.assertEqual(query_res.row_count, 1)
        self.assertEqual(query_res.rows[0][0], "Pride and Prejudice")

        connector.close()

if __name__ == "__main__":
    unittest.main()

