from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.models.schema_models import SchemaDefinition, DiagramLayout
from app.models.response_models import ApiResponse, QueryResultResponse
from app.services.parsing_service import ParsingService
from app.services.diagram_service import DiagramService
from app.services.connection_service import ConnectionService
from app.services.query_service import QueryService
from app.sql_engine.sql_generator import SQLGenerator
from app.sql_engine.sql_validator import SQLValidator

router = APIRouter()

class ParseSqlRequest(BaseModel):
    sql: str
    dialect: Optional[str] = "standard"

class GenerateSqlRequest(BaseModel):
    schema_definition: SchemaDefinition
    dialect: str = "postgresql"

class ExecuteSqlRequest(BaseModel):
    connection_id: Optional[str] = None
    query: str
    limit: int = 100
    offset: int = 0

@router.post("/parse", response_model=ApiResponse[DiagramLayout])
async def parse_sql(req: ParseSqlRequest):
    try:
        service = ParsingService(dialect=req.dialect or "standard")
        schema = service.parse_sql_to_schema(req.sql)
        layout = DiagramService.create_diagram_layout(schema)
        return ApiResponse(
            success=True,
            message=f"Parsed {len(schema.tables)} tables and {len(schema.relationships)} relationships successfully.",
            data=layout
        )
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "PARSER_ERROR", "message": str(e)}])

@router.post("/generate", response_model=ApiResponse[str])
async def generate_sql(req: GenerateSqlRequest):
    try:
        ddl = SQLGenerator.generate_ddl(req.schema_definition, dialect=req.dialect)
        return ApiResponse(success=True, message="DDL generated successfully", data=ddl)
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "GENERATOR_ERROR", "message": str(e)}])

@router.post("/validate", response_model=ApiResponse[dict])
async def validate_sql(req: ParseSqlRequest):
    is_valid, errors = SQLValidator.validate_syntax(req.sql)
    return ApiResponse(
        success=is_valid,
        message="SQL syntax is valid." if is_valid else "Syntax issues detected.",
        data={"is_valid": is_valid, "errors": errors}
    )

@router.post("/execute", response_model=ApiResponse[QueryResultResponse])
async def execute_sql(req: ExecuteSqlRequest):
    try:
        if not req.connection_id:
            # Fallback to local memory SQLite
            from app.models.connection_models import DatabaseConnectionConfig, DatabaseType
            cfg = DatabaseConnectionConfig(name="memory", db_type=DatabaseType.SQLITE, database=":memory:")
        else:
            cfg = ConnectionService.get_connection(req.connection_id)
            if not cfg:
                raise HTTPException(status_code=404, detail="Connection profile not found")

        result = QueryService.execute_query(cfg, req.query, limit=req.limit, offset=req.offset)
        return ApiResponse(success=True, message="Query executed successfully", data=result)
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "EXECUTION_ERROR", "message": str(e)}])

@router.get("/history", response_model=ApiResponse[list])
async def get_query_history():
    history = QueryService.get_query_history()
    return ApiResponse(success=True, message="Query history retrieved", data=history)

