from typing import List, Dict, Any
from app.models.connection_models import DatabaseConnectionConfig
from app.models.schema_models import SchemaDefinition
from app.services.connection_service import ConnectionService

class MetadataService:
    """Reflects schema and database catalogs from live connections."""

    @classmethod
    def get_database_schema(cls, config: DatabaseConnectionConfig) -> SchemaDefinition:
        connector = ConnectionService.get_connector_for(config)
        try:
            return connector.extract_schema()
        finally:
            connector.close()

    @classmethod
    def get_table_names(cls, config: DatabaseConnectionConfig) -> List[str]:
        connector = ConnectionService.get_connector_for(config)
        try:
            return connector.get_tables()
        finally:
            connector.close()

