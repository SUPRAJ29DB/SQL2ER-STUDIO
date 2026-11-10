from fastapi import APIRouter
from app.models.schema_models import SchemaDefinition, DiagramLayout
from app.models.response_models import ApiResponse, SchemaValidationResponse
from app.services.diagram_service import DiagramService
from app.schema_engine.validator import SchemaValidator

router = APIRouter()

@router.post("/layout", response_model=ApiResponse[DiagramLayout])
async def compute_layout(schema: SchemaDefinition):
    layout = DiagramService.create_diagram_layout(schema)
    return ApiResponse(success=True, message="Diagram layout computed", data=layout)

@router.post("/validate", response_model=ApiResponse[SchemaValidationResponse])
async def validate_diagram_schema(schema: SchemaDefinition):
    result = SchemaValidator.validate_schema(schema)
    return ApiResponse(
        success=result.is_valid,
        message=result.summary,
        data=result
    )

@router.post("/export/json", response_model=ApiResponse[dict])
async def export_diagram_json(layout: DiagramLayout):
    return ApiResponse(
        success=True,
        message="Diagram export ready",
        data=layout.dict()
    )

