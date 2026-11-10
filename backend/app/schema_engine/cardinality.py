from typing import List, Dict, Tuple
from app.models.schema_models import TableDefinition, RelationshipDefinition, CardinalityType

class CardinalityResolver:
    """
    Infers and resolves cardinality between tables:
    - 1:1 when the foreign key column is also a Primary Key or UNIQUE.
    - 1:N standard foreign key reference.
    - N:M when a junction table connects two entities via composite foreign keys.
    """

    @classmethod
    def resolve_cardinalities(cls, tables: List[TableDefinition], relationships: List[RelationshipDefinition]) -> List[RelationshipDefinition]:
        table_map: Dict[str, TableDefinition] = {t.name.lower(): t for t in tables}
        
        # 1. Detect Junction Tables (Tables where PK is composed of >= 2 FKs to different tables)
        junction_tables = set()
        for t in tables:
            fks = t.foreign_keys
            if len(fks) >= 2:
                pk_cols = set(c.lower() for c in t.primary_keys)
                fk_cols = set()
                for fk in fks:
                    for c in fk.constrained_columns:
                        fk_cols.add(c.lower())
                # If primary key is entirely covered by FKs, or table has very few other attributes
                if (pk_cols and pk_cols.issubset(fk_cols)) or len(t.columns) <= (len(fk_cols) + 2):
                    junction_tables.add(t.name.lower())

        # Update relationships
        for rel in relationships:
            src_table = table_map.get(rel.source_table.lower())
            if not src_table:
                continue

            if src_table.name.lower() in junction_tables:
                rel.is_junction_table = True
                rel.junction_table_name = src_table.name

            # Check if source column is unique
            is_unique = False
            for col in src_table.columns:
                if col.name.lower() == rel.source_column.lower():
                    if col.is_primary_key or col.is_unique:
                        is_unique = True
                    break

            for idx in src_table.indexes:
                if idx.is_unique and len(idx.columns) == 1 and idx.columns[0].lower() == rel.source_column.lower():
                    is_unique = True
                    break

            if is_unique:
                rel.cardinality = CardinalityType.ONE_TO_ONE
            else:
                rel.cardinality = CardinalityType.ONE_TO_MANY

        return relationships

