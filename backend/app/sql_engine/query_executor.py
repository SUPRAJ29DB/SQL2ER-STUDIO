import time
from typing import Optional
from app.models.connection_models import DatabaseConnectionConfig, DatabaseType
from app.models.response_models import QueryResultResponse
from app.connectors.sqlite import SQLiteConnector
from app.connectors.postgresql import PostgreSQLConnector
from app.connectors.mysql import MySQLConnector
from app.utils.security import validate_safe_query
from app.utils.exceptions import SQL2ERException

class QueryExecutor:
    """Executes arbitrary SQL queries across configured database connectors."""

    @classmethod
    def execute(cls, config: DatabaseConnectionConfig, query: str, limit: int = 100, offset: int = 0) -> QueryResultResponse:
        if not validate_safe_query(query):
            raise SQL2ERException("Forbidden query structure or disallowed statement detected.", code="UNSAFE_QUERY")

        if config.db_type == DatabaseType.SQLITE:
            connector = SQLiteConnector(config.file_path or config.database)
        elif config.db_type == DatabaseType.POSTGRESQL:
            connector = PostgreSQLConnector(config)
        elif config.db_type == DatabaseType.MYSQL:
            connector = MySQLConnector(config)
        else:
            raise SQL2ERException(f"Unsupported database type: {config.db_type}", code="INVALID_DB_TYPE")

        try:
            return connector.execute_query(query, limit=limit, offset=offset)
        finally:
            connector.close()

