import time
from typing import List, Dict, Any
from app.models.connection_models import DatabaseConnectionConfig
from app.models.response_models import QueryResultResponse
from app.sql_engine.query_executor import QueryExecutor

class QueryService:
    """Executes queries and maintains execution history logs."""

    _history: List[Dict[str, Any]] = []

    @classmethod
    def execute_query(cls, config: DatabaseConnectionConfig, query: str, limit: int = 100, offset: int = 0) -> QueryResultResponse:
        result = QueryExecutor.execute(config, query, limit=limit, offset=offset)

        # Log history
        cls._history.insert(0, {
            "timestamp": time.time(),
            "query": query,
            "row_count": result.row_count,
            "execution_time_ms": result.execution_time_ms,
            "database": config.database,
            "success": True
        })
        if len(cls._history) > 100:
            cls._history.pop()

        return result

    @classmethod
    def get_query_history(cls) -> List[Dict[str, Any]]:
        return cls._history

