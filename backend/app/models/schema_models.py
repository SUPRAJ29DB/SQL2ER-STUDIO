from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CardinalityType(str, Enum):
    ONE_TO_ONE = "1:1"
    ONE_TO_MANY = "1:N"
    MANY_TO_ONE = "N:1"
    MANY_TO_MANY = "N:M"

class ColumnDefinition(BaseModel):
    name: str
    data_type: str
    is_primary_key: bool = False
    is_foreign_key: bool = False
    is_nullable: bool = True
    is_unique: bool = False
    is_auto_increment: bool = False
    default_value: Optional[str] = None
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    comment: Optional[str] = None

class ForeignKeyDefinition(BaseModel):
    name: Optional[str] = None
    constrained_columns: List[str]
    referred_table: str
    referred_columns: List[str]
    on_delete: Optional[str] = "NO ACTION"
    on_update: Optional[str] = "NO ACTION"

class IndexDefinition(BaseModel):
    name: str
    columns: List[str]
    is_unique: bool = False

class TableDefinition(BaseModel):
    name: str
    schema_name: Optional[str] = "public"
    columns: List[ColumnDefinition] = Field(default_factory=list)
    primary_keys: List[str] = Field(default_factory=list)
    foreign_keys: List[ForeignKeyDefinition] = Field(default_factory=list)
    indexes: List[IndexDefinition] = Field(default_factory=list)
    comment: Optional[str] = None

class RelationshipDefinition(BaseModel):
    id: str
    source_table: str
    source_column: str
    target_table: str
    target_column: str
    cardinality: CardinalityType = CardinalityType.ONE_TO_MANY
    on_delete: Optional[str] = "NO ACTION"
    on_update: Optional[str] = "NO ACTION"
    is_junction_table: bool = False
    junction_table_name: Optional[str] = None

class SchemaDefinition(BaseModel):
    database_name: Optional[str] = "default_db"
    dialect: Optional[str] = "standard"
    tables: List[TableDefinition] = Field(default_factory=list)
    relationships: List[RelationshipDefinition] = Field(default_factory=list)

# Diagram Visual Layout Models (compatible with React Flow)
class NodePosition(BaseModel):
    x: float
    y: float

class DiagramNode(BaseModel):
    id: str
    type: str = "tableNode"
    position: NodePosition
    data: Dict[str, Any]

class DiagramEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    type: str = "relationshipEdge"
    animated: bool = False
    data: Dict[str, Any] = Field(default_factory=dict)

class DiagramLayout(BaseModel):
    nodes: List[DiagramNode] = Field(default_factory=list)
    edges: List[DiagramEdge] = Field(default_factory=list)
    schema_definition: SchemaDefinition

