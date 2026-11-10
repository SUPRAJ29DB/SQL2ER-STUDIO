from fastapi import APIRouter, HTTPException
from typing import List, Any
from app.models.response_models import ApiResponse, QueryResultResponse
from app.models.schema_models import DiagramLayout
from app.services.connection_service import ConnectionService
from app.services.metadata_service import MetadataService
from app.services.diagram_service import DiagramService
from app.services.query_service import QueryService

router = APIRouter()

@router.get("/{connection_id}/schema", response_model=ApiResponse[DiagramLayout])
async def get_live_database_schema(connection_id: str):
    config = ConnectionService.get_connection(connection_id)
    if not config:
        raise HTTPException(status_code=404, detail="Database connection profile not found")

    try:
        schema = MetadataService.get_database_schema(config)
        layout = DiagramService.create_diagram_layout(schema)
        return ApiResponse(
            success=True,
            message=f"Introspected schema from '{config.name}' successfully.",
            data=layout
        )
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "INTROSPECTION_ERROR", "message": str(e)}])

@router.get("/{connection_id}/tables", response_model=ApiResponse[List[str]])
async def get_database_tables(connection_id: str):
    config = ConnectionService.get_connection(connection_id)
    if not config:
        raise HTTPException(status_code=404, detail="Database connection profile not found")

    try:
        tables = MetadataService.get_table_names(config)
        return ApiResponse(success=True, message="Tables listed", data=tables)
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "TABLE_LIST_ERROR", "message": str(e)}])

@router.get("/{connection_id}/table/{table_name}/preview", response_model=ApiResponse[QueryResultResponse])
async def preview_table_data(connection_id: str, table_name: str, limit: int = 50):
    config = ConnectionService.get_connection(connection_id)
    if not config:
        raise HTTPException(status_code=404, detail="Database connection profile not found")

    try:
        query = f"SELECT * FROM {table_name}"
        result = QueryService.execute_query(config, query, limit=limit, offset=0)
        return ApiResponse(success=True, message=f"Fetched preview for table '{table_name}'", data=result)
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "PREVIEW_ERROR", "message": str(e)}])

