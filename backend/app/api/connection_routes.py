from fastapi import APIRouter, HTTPException
from typing import List
from app.models.connection_models import DatabaseConnectionConfig
from app.models.response_models import ApiResponse
from app.services.connection_service import ConnectionService

router = APIRouter()

@router.post("", response_model=ApiResponse[DatabaseConnectionConfig])
async def save_connection(config: DatabaseConnectionConfig):
    saved = ConnectionService.save_connection(config)
    return ApiResponse(success=True, message="Connection saved successfully", data=saved)

@router.get("", response_model=ApiResponse[List[DatabaseConnectionConfig]])
async def list_connections():
    conns = ConnectionService.list_connections()
    return ApiResponse(success=True, message="Retrieved connections", data=conns)

@router.get("/{connection_id}", response_model=ApiResponse[DatabaseConnectionConfig])
async def get_connection(connection_id: str):
    conn = ConnectionService.get_connection(connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return ApiResponse(success=True, message="Retrieved connection", data=conn)

@router.delete("/{connection_id}", response_model=ApiResponse[bool])
async def delete_connection(connection_id: str):
    deleted = ConnectionService.delete_connection(connection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")
    return ApiResponse(success=True, message="Connection removed", data=True)

@router.post("/test", response_model=ApiResponse[bool])
async def test_connection(config: DatabaseConnectionConfig):
    try:
        is_ok = ConnectionService.test_connection(config)
        return ApiResponse(
            success=is_ok,
            message="Connection successful!" if is_ok else "Failed to establish connection.",
            data=is_ok
        )
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "CONN_TEST_FAILED", "message": str(e)}])

