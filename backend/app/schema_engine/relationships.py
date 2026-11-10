from typing import List, Optional
from app.models.schema_models import RelationshipDefinition, CardinalityType, TableDefinition

class RelationshipManager:
    """Manages adding, removing, and querying relationships within a database schema."""

    @staticmethod
    def add_relationship(
        relationships: List[RelationshipDefinition],
        source_table: str,
        source_col: str,
        target_table: str,
        target_col: str,
        cardinality: CardinalityType = CardinalityType.ONE_TO_MANY,
        on_delete: str = "NO ACTION",
        on_update: str = "NO ACTION"
    ) -> RelationshipDefinition:
        rel_id = f"rel_{source_table}_{source_col}_to_{target_table}_{target_col}"
        
        # Remove existing if overwriting
        updated = [r for r in relationships if r.id != rel_id]
        
        new_rel = RelationshipDefinition(
            id=rel_id,
            source_table=source_table,
            source_column=source_col,
            target_table=target_table,
            target_column=target_col,
            cardinality=cardinality,
            on_delete=on_delete,
            on_update=on_update
        )
        relationships.clear()
        relationships.extend(updated + [new_rel])
        return new_rel

    @staticmethod
    def remove_relationship(relationships: List[RelationshipDefinition], rel_id: str) -> bool:
        initial_len = len(relationships)
        filtered = [r for r in relationships if r.id != rel_id]
        relationships.clear()
        relationships.extend(filtered)
        return len(relationships) < initial_len

