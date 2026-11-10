import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_sql_parse_endpoint(self):
        sql = "CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(100));"
        res = self.client.post("/api/sql/parse", json={"sql": sql, "dialect": "standard"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["data"]["nodes"]), 1)

if __name__ == "__main__":
    unittest.main()

