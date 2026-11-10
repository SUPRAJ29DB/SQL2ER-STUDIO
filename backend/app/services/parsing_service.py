from typing import Optional
from app.models.schema_models import SchemaDefinition
from app.parser.sql_parser import SQLParser
from app.schema_engine.cardinality import CardinalityResolver
from app.schema_engine.validator import SchemaValidator

class ParsingService:
    """Orchestrates SQL script parsing, cardinality resolution, and schema validation."""

    def __init__(self, dialect: str = "standard"):
        self.parser = SQLParser(dialect=dialect)

    def parse_sql_to_schema(self, sql_script: str) -> SchemaDefinition:
        # 1. Parse SQL into initial SchemaDefinition
        schema = self.parser.parse(sql_script)

        # 2. Refine cardinalities (1:1, 1:N, junction tables)
        schema.relationships = CardinalityResolver.resolve_cardinalities(
            schema.tables,
            schema.relationships
        )

        return schema

