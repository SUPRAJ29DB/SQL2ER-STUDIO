import unittest
from app.models.schema_models import SchemaDefinition, TableDefinition, ColumnDefinition, ForeignKeyDefinition
from app.schema_engine.validator import SchemaValidator
from app.sql_engine.sql_generator import SQLGenerator

class TestSchemaEngine(unittest.TestCase):

    def test_schema_validator_catches_missing_target_table(self):
        broken_schema = SchemaDefinition(
            tables=[
                TableDefinition(
                    name="orders",
                    columns=[ColumnDefinition(name="id", data_type="INT", is_primary_key=True)],
                    primary_keys=["id"],
                    foreign_keys=[
                        ForeignKeyDefinition(
                            name="fk_nonexistent",
                            constrained_columns=["user_id"],
                            referred_table="nonexistent_users",
                            referred_columns=["id"]
                        )
                    ]
                )
            ],
            relationships=[]
        )
        res = SchemaValidator.validate_schema(broken_schema)
        self.assertFalse(res.is_valid)
        self.assertTrue(any("nonexistent_users" in err for err in res.errors))

    def test_sql_ddl_generation(self):
        schema = SchemaDefinition(
            tables=[
                TableDefinition(
                    name="customers",
                    columns=[
                        ColumnDefinition(name="id", data_type="SERIAL", is_primary_key=True, is_auto_increment=True),
                        ColumnDefinition(name="email", data_type="VARCHAR(255)", is_nullable=False, is_unique=True)
                    ],
                    primary_keys=["id"]
                )
            ],
            relationships=[]
        )
        ddl_pg = SQLGenerator.generate_ddl(schema, dialect="postgresql")
        self.assertIn('CREATE TABLE "customers"', ddl_pg)
        self.assertIn('"email" VARCHAR(255) NOT NULL UNIQUE', ddl_pg)

if __name__ == "__main__":
    unittest.main()

