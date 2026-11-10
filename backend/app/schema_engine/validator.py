from typing import List, Dict
from app.models.schema_models import SchemaDefinition, TableDefinition
from app.models.response_models import SchemaValidationResponse

class SchemaValidator:
    """Validates structural integrity, referential constraints, and naming of a SchemaDefinition."""

    @classmethod
    def validate_schema(cls, schema: SchemaDefinition) -> SchemaValidationResponse:
        errors: List[str] = []
        warnings: List[str] = []

        table_map: Dict[str, TableDefinition] = {t.name.lower(): t for t in schema.tables}

        # 1. Check duplicate tables
        seen_tables = set()
        for t in schema.tables:
            name_lower = t.name.lower()
            if name_lower in seen_tables:
                errors.append(f"Duplicate table defined: '{t.name}'")
            seen_tables.add(name_lower)

        # 2. Inspect each table
        for t in schema.tables:
            # Check primary key existence
            if not t.primary_keys and not any(c.is_primary_key for c in t.columns):
                warnings.append(f"Table '{t.name}' does not define a PRIMARY KEY.")

            # Check duplicate columns
            seen_cols = set()
            for c in t.columns:
                col_lower = c.name.lower()
                if col_lower in seen_cols:
                    errors.append(f"Table '{t.name}' has duplicate column '{c.name}'")
                seen_cols.add(col_lower)

            # Check foreign key validity
            for fk in t.foreign_keys:
                ref_table_lower = fk.referred_table.lower()
                if ref_table_lower not in table_map:
                    errors.append(f"Table '{t.name}' foreign key '{fk.name}' references non-existent table '{fk.referred_table}'.")
                else:
                    ref_tbl = table_map[ref_table_lower]
                    for ref_col in fk.referred_columns:
                        if not any(c.name.lower() == ref_col.lower() for c in ref_tbl.columns):
                            errors.append(f"Table '{t.name}' foreign key references non-existent column '{ref_col}' in '{fk.referred_table}'.")

        # 3. Check relationships
        for rel in schema.relationships:
            if rel.source_table.lower() not in table_map:
                errors.append(f"Relationship refers to missing source table: '{rel.source_table}'")
            if rel.target_table.lower() not in table_map:
                errors.append(f"Relationship refers to missing target table: '{rel.target_table}'")

        is_valid = len(errors) == 0
        summary = f"Validation completed: {len(errors)} error(s), {len(warnings)} warning(s)."

        return SchemaValidationResponse(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            summary=summary
        )

