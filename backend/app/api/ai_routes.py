from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.models.schema_models import RelationshipDefinition, SchemaDefinition
from app.models.response_models import ApiResponse, AISuggestionResponse
from app.ai.explanation_engine import RelationshipExplainer
from app.ai.suggestion_engine import AISuggestionEngine
from app.ai.llm_engine import LLMEngine
from app.ai.prompts import AIPromptTemplates

router = APIRouter()

class ExplainRelationshipRequest(BaseModel):
    relationship: RelationshipDefinition
    schema_definition: Optional[SchemaDefinition] = None

class AIChatRequest(BaseModel):
    message: str
    schema_context: Optional[SchemaDefinition] = None

@router.post("/explain-relationship", response_model=ApiResponse[str])
async def explain_relationship(req: ExplainRelationshipRequest):
    explainer = RelationshipExplainer()
    explanation = await explainer.explain_relationship(req.relationship, req.schema_definition)
    return ApiResponse(
        success=True,
        message="Relationship explanation generated",
        data=explanation
    )

@router.post("/suggestions", response_model=ApiResponse[AISuggestionResponse])
async def get_schema_suggestions(schema: SchemaDefinition):
    engine = AISuggestionEngine()
    suggestions = await engine.get_suggestions(schema)
    return ApiResponse(
        success=True,
        message=suggestions.summary,
        data=suggestions
    )

@router.post("/chat", response_model=ApiResponse[str])
async def ai_chat(req: AIChatRequest):
    engine = LLMEngine()
    context = ""
    if req.schema_context:
        tables = [t.name for t in req.schema_context.tables]
        context = f"\nCurrent Active Schema Tables: {tables}\nTotal Relationships: {len(req.schema_context.relationships)}"

    user_prompt = f"{req.message}\n{context}" if context else req.message
    reply = await engine.generate_response(AIPromptTemplates.CHAT_ASSISTANT_SYSTEM, user_prompt)
    return ApiResponse(success=True, message="AI response generated", data=reply)

