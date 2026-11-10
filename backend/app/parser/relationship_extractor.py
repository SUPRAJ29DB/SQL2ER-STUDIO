from typing import List, Dict
from app.models.schema_models import TableDefinition, RelationshipDefinition, CardinalityType

class RelationshipExtractor:
    """Derives relationship definitions and preliminary cardinality from parsed tables."""

    @staticmethod
    def build_relationships(tables: List[TableDefinition]) -> List[RelationshipDefinition]:
        relationships: List[RelationshipDefinition] = []
        table_map: Dict[str, TableDefinition] = {t.name.lower(): t for t in tables}

        for table in tables:
            # 1. From table-level & ALTER TABLE foreign keys
            for fk in table.foreign_keys:
                source_col = fk.constrained_columns[0] if fk.constrained_columns else "id"
                target_col = fk.referred_columns[0] if fk.referred_columns else "id"
                target_table = fk.referred_table

                # Determine if source column is unique (implying 1:1)
                is_source_unique = False
                for col in table.columns:
                    if col.name.lower() == source_col.lower() and (col.is_primary_key or col.is_unique):
                        is_source_unique = True
                        break

                for idx in table.indexes:
                    if idx.is_unique and len(idx.columns) == 1 and idx.columns[0].lower() == source_col.lower():
                        is_source_unique = True
                        break

                cardinality = CardinalityType.ONE_TO_ONE if is_source_unique else CardinalityType.ONE_TO_MANY

                rel_id = f"rel_{table.name}_{source_col}_to_{target_table}_{target_col}"
                relationships.append(RelationshipDefinition(
                    id=rel_id,
                    source_table=table.name,
                    source_column=source_col,
                    target_table=target_table,
                    target_column=target_col,
                    cardinality=cardinality,
                    on_delete=fk.on_delete or "NO ACTION",
                    on_update=fk.on_update or "NO ACTION"
                ))

            # 2. From column-level inline REFERENCES
            for col in table.columns:
                if col.references_table and col.references_column:
                    # Avoid duplicate if already covered by fk
                    already_exists = any(
                        r.source_table.lower() == table.name.lower() and
                        r.source_column.lower() == col.name.lower() and
                        r.target_table.lower() == col.references_table.lower()
                        for r in relationships
                    )
                    if not already_exists:
                        cardinality = CardinalityType.ONE_TO_ONE if (col.is_primary_key or col.is_unique) else CardinalityType.ONE_TO_MANY
                        rel_id = f"rel_{table.name}_{col.name}_to_{col.references_table}_{col.references_column}"
                        relationships.append(RelationshipDefinition(
                            id=rel_id,
                            source_table=table.name,
                            source_column=col.name,
                            target_table=col.references_table,
                            target_column=col.references_column,
                            cardinality=cardinality
                        ))

        return relationships

