import math
from typing import List, Dict, Any
from app.models.schema_models import (
    SchemaDefinition, DiagramLayout, DiagramNode, DiagramEdge, NodePosition
)

class DiagramService:
    """Transforms logical SchemaDefinition into visual DiagramLayout with auto-layout positions."""

    @classmethod
    def create_diagram_layout(cls, schema: SchemaDefinition) -> DiagramLayout:
        nodes: List[DiagramNode] = []
        edges: List[DiagramEdge] = []

        tables = schema.tables
        total_tables = len(tables)

        # Calculate grid layout positions
        cols = max(1, math.ceil(math.sqrt(total_tables)))
        node_width = 280
        node_height_base = 120
        gap_x = 100
        gap_y = 120

        table_positions: Dict[str, NodePosition] = {}

        for index, table in enumerate(tables):
            row_idx = index // cols
            col_idx = index % cols

            x = 80 + col_idx * (node_width + gap_x)
            # Estimate height based on number of columns
            estimated_height = node_height_base + (len(table.columns) * 28)
            y = 80 + row_idx * (estimated_height + gap_y)

            pos = NodePosition(x=float(x), y=float(y))
            table_positions[table.name.lower()] = pos

            nodes.append(DiagramNode(
                id=table.name,
                type="tableNode",
                position=pos,
                data={
                    "label": table.name,
                    "table": table.dict(),
                    "schemaName": table.schema_name or "public"
                }
            ))

        # Generate Edges
        for rel in schema.relationships:
            edges.append(DiagramEdge(
                id=rel.id,
                source=rel.source_table,
                target=rel.target_table,
                sourceHandle=f"{rel.source_table}-{rel.source_column}-source",
                targetHandle=f"{rel.target_table}-{rel.target_column}-target",
                type="relationshipEdge",
                animated=False,
                data={
                    "cardinality": rel.cardinality.value if hasattr(rel.cardinality, 'value') else str(rel.cardinality),
                    "sourceColumn": rel.source_column,
                    "targetColumn": rel.target_column,
                    "onDelete": rel.on_delete,
                    "onUpdate": rel.on_update,
                    "isJunctionTable": rel.is_junction_table
                }
            ))

        return DiagramLayout(
            nodes=nodes,
            edges=edges,
            schema_definition=schema
        )

