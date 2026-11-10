import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.response_models import ApiResponse
from app.models.schema_models import DiagramLayout
from app.services.parsing_service import ParsingService
from app.services.diagram_service import DiagramService
from app.connectors.sqlite import SQLiteConnector
from app.config import settings

router = APIRouter()

@router.post("/sql-file", response_model=ApiResponse[DiagramLayout])
async def upload_sql_file(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        sql_text = content_bytes.decode("utf-8", errors="replace")

        service = ParsingService()
        schema = service.parse_sql_to_schema(sql_text)
        layout = DiagramService.create_diagram_layout(schema)

        return ApiResponse(
            success=True,
            message=f"Uploaded and parsed '{file.filename}' successfully.",
            data=layout
        )
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "UPLOAD_ERROR", "message": str(e)}])

@router.post("/sqlite-db", response_model=ApiResponse[DiagramLayout])
async def upload_sqlite_db(file: UploadFile = File(...)):
    try:
        os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
        dest_path = os.path.join(settings.EXPORTS_DIR, file.filename)
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        connector = SQLiteConnector(dest_path)
        schema = connector.extract_schema()
        connector.close()

        layout = DiagramService.create_diagram_layout(schema)
        return ApiResponse(
            success=True,
            message=f"Uploaded and reflected SQLite database '{file.filename}' successfully.",
            data=layout
        )
    except Exception as e:
        return ApiResponse(success=False, message=str(e), errors=[{"code": "SQLITE_UPLOAD_ERROR", "message": str(e)}])

