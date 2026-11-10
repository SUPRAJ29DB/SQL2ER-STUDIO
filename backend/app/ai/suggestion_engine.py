from typing import Optional
from app.models.schema_models import SchemaDefinition
from app.models.response_models import AISuggestionResponse
from app.schema_engine.schema_analyzer import SchemaAnalyzer
from app.ai.llm_engine import LLMEngine
from app.ai.prompts import AIPromptTemplates

class AISuggestionEngine:
    """Generates schema health scores and architectural suggestions combining heuristics and LLM."""

    def __init__(self, llm_engine: Optional[LLMEngine] = None):
        self.llm = llm_engine or LLMEngine()

    async def get_suggestions(self, schema: SchemaDefinition) -> AISuggestionResponse:
        # 1. Base static analysis from SchemaAnalyzer
        base_response = SchemaAnalyzer.analyze(schema)

        # 2. If external LLM is enabled and configured, enrich summary
        if self.llm.provider != "offline":
            schema_summary = f"Tables: {[t.name for t in schema.tables]}\nRelationships: {len(schema.relationships)}"
            prompt = AIPromptTemplates.SUGGEST_SCHEMA_IMPROVEMENTS.format(schema_summary=schema_summary)
            try:
                ai_text = await self.llm.generate_response(AIPromptTemplates.CHAT_ASSISTANT_SYSTEM, prompt)
                base_response.summary = f"{base_response.summary}\n\nAI Insights:\n{ai_text}"
            except Exception:
                pass

        return base_response

