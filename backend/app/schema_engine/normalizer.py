import re
from typing import List, Dict, Any
from app.models.schema_models import SchemaDefinition, TableDefinition

class SchemaNormalizer:
    """Analyzes database schemas for relational normalization violations (1NF, 2NF, 3NF)."""

    @classmethod
    def analyze_normalization(cls, schema: SchemaDefinition) -> List[Dict[str, Any]]:
        findings = []

        for table in schema.tables:
            # 1. 1NF Check: Columns likely holding comma-separated lists or non-atomic values
            for col in table.columns:
                name_lower = col.name.lower()
                if any(suffix in name_lower for suffix in ["_list", "_csv", "tags", "categories", "phones", "emails"]):
                    if "VARCHAR" in col.data_type or "TEXT" in col.data_type:
                        findings.append({
                            "table": table.name,
                            "column": col.name,
                            "form": "1NF",
                            "severity": "warning",
                            "issue": f"Column '{col.name}' might violate First Normal Form (1NF) by holding non-atomic values or lists.",
                            "recommendation": f"Create a separate child table '{table.name}_{col.name}' with a foreign key referencing '{table.name}'."
                        })

            # 2. 2NF Check: Composite primary key with non-key columns depending partially on part of PK
            if len(table.primary_keys) > 1:
                pk_set = set(p.lower() for p in table.primary_keys)
                for col in table.columns:
                    col_lower = col.name.lower()
                    if col_lower not in pk_set:
                        # Check prefix matches
                        for pk in table.primary_keys:
                            pk_prefix = pk.lower().replace("_id", "")
                            if col_lower.startswith(pk_prefix + "_") and not col.is_foreign_key:
                                findings.append({
                                    "table": table.name,
                                    "column": col.name,
                                    "form": "2NF",
                                    "severity": "info",
                                    "issue": f"Column '{col.name}' in composite-PK table '{table.name}' may depend only on part of PK ('{pk}'), violating 2NF.",
                                    "recommendation": f"Move '{col.name}' to the entity table referenced by '{pk}'."
                                })

            # 3. 3NF Check: Transitive dependency indicators (e.g. city/state when zip_code is present)
            col_names = [c.name.lower() for c in table.columns]
            if "zip_code" in col_names or "postal_code" in col_names:
                if "city" in col_names and "state" in col_names:
                    findings.append({
                        "table": table.name,
                        "column": "city, state",
                        "form": "3NF",
                        "severity": "info",
                        "issue": f"Table '{table.name}' contains 'city' and 'state' along with 'zip_code', which can introduce transitive dependencies.",
                        "recommendation": "Consider a separate 'zip_codes' reference lookup table to achieve 3NF."
                    })

        return findings

