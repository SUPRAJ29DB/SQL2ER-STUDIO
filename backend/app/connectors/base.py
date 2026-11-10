from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.models.schema_models import SchemaDefinition, TableDefinition
from app.models.response_models import QueryResultResponse

class BaseConnector(ABC):
    """Abstract interface for database schema reflection and query execution."""

    @abstractmethod
    def test_connection(self) -> bool:
        """Verify database connectivity."""
        pass

    @abstractmethod
    def get_tables(self) -> List[str]:
        """List table names."""
        pass

    @abstractmethod
    def extract_schema(self) -> SchemaDefinition:
        """Reverse engineer complete schema into SchemaDefinition."""
        pass

    @abstractmethod
    def execute_query(self, query: str, limit: int = 100, offset: int = 0) -> QueryResultResponse:
        """Execute arbitrary SELECT query and return rows and columns."""
        pass

    @abstractmethod
    def close(self):
        """Close connection pools."""
        pass

