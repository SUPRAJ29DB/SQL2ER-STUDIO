from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, Field

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = "Operation successful"
    data: Optional[T] = None
    errors: Optional[List[ErrorDetail]] = None

class QueryResultResponse(BaseModel):
    columns: List[str] = Field(default_factory=list)
    rows: List[List[Any]] = Field(default_factory=list)
    row_count: int = 0
    execution_time_ms: float = 0.0
    query: str

class SchemaValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    summary: str = ""

class AISuggestionItem(BaseModel):
    type: str  # missing_fk, index_needed, normalization, naming_convention, data_type
    severity: str  # info, warning, critical
    table: Optional[str] = None
    column: Optional[str] = None
    title: str
    description: str
    recommended_sql: Optional[str] = None

class AISuggestionResponse(BaseModel):
    suggestions: List[AISuggestionItem] = Field(default_factory=list)
    quality_score: int = 100
    summary: str = ""

