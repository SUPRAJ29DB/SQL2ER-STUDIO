import uuid
from typing import Dict, List, Optional
from app.models.connection_models import DatabaseConnectionConfig, DatabaseType
from app.connectors.sqlite import SQLiteConnector
from app.connectors.postgresql import PostgreSQLConnector
from app.connectors.mysql import MySQLConnector
from app.utils.exceptions import SQL2ERException

class ConnectionService:
    """Manages database connection profiles and instances."""

    _connections: Dict[str, DatabaseConnectionConfig] = {}

    @classmethod
    def save_connection(cls, config: DatabaseConnectionConfig) -> DatabaseConnectionConfig:
        if not config.id:
            config.id = str(uuid.uuid4())[:8]
        cls._connections[config.id] = config
        return config

    @classmethod
    def get_connection(cls, connection_id: str) -> Optional[DatabaseConnectionConfig]:
        return cls._connections.get(connection_id)

    @classmethod
    def list_connections(cls) -> List[DatabaseConnectionConfig]:
        return list(cls._connections.values())

    @classmethod
    def delete_connection(cls, connection_id: str) -> bool:
        if connection_id in cls._connections:
            del cls._connections[connection_id]
            return True
        return False

    @classmethod
    def test_connection(cls, config: DatabaseConnectionConfig) -> bool:
        connector = cls.get_connector_for(config)
        try:
            return connector.test_connection()
        finally:
            connector.close()

    @classmethod
    def get_connector_for(cls, config: DatabaseConnectionConfig):
        if config.db_type == DatabaseType.SQLITE:
            return SQLiteConnector(config.file_path or config.database)
        elif config.db_type == DatabaseType.POSTGRESQL:
            return PostgreSQLConnector(config)
        elif config.db_type == DatabaseType.MYSQL:
            return MySQLConnector(config)
        raise SQL2ERException(f"Unsupported connector for type: {config.db_type}")

