import unittest
from app.models.schema_models import (
    TableDefinition, ColumnDefinition, RelationshipDefinition, CardinalityType, ForeignKeyDefinition
)
from app.schema_engine.cardinality import CardinalityResolver

class TestRelationshipsAndCardinality(unittest.TestCase):

    def test_one_to_one_cardinality_when_fk_is_unique(self):
        user_profiles = TableDefinition(
            name="user_profiles",
            columns=[
                ColumnDefinition(name="id", data_type="INT", is_primary_key=True),
                ColumnDefinition(name="user_id", data_type="INT", is_unique=True, is_foreign_key=True)
            ],
            primary_keys=["id"],
            foreign_keys=[
                ForeignKeyDefinition(
                    constrained_columns=["user_id"],
                    referred_table="users",
                    referred_columns=["id"]
                )
            ]
        )
        rel = RelationshipDefinition(
            id="rel_test",
            source_table="user_profiles",
            source_column="user_id",
            target_table="users",
            target_column="id",
            cardinality=CardinalityType.ONE_TO_MANY
        )

        resolved = CardinalityResolver.resolve_cardinalities([user_profiles], [rel])
        self.assertEqual(resolved[0].cardinality, CardinalityType.ONE_TO_ONE)

if __name__ == "__main__":
    unittest.main()

