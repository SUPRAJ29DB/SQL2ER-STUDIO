from typing import Optional
from app.models.schema_models import RelationshipDefinition, SchemaDefinition
from app.ai.llm_engine import LLMEngine
from app.ai.prompts import AIPromptTemplates

class RelationshipExplainer:
    """Provides plain-language architectural explanations for database relationships."""

    def __init__(self, llm_engine: Optional[LLMEngine] = None):
        self.llm = llm_engine or LLMEngine()

    async def explain_relationship(self, relationship: RelationshipDefinition, schema: Optional[SchemaDefinition] = None) -> str:
        source_cols = ""
        target_cols = ""

        if schema:
            for t in schema.tables:
                if t.name.lower() == relationship.source_table.lower():
                    source_cols = "\n".join(f"- {c.name} ({c.data_type})" for c in t.columns)
                elif t.name.lower() == relationship.target_table.lower():
                    target_cols = "\n".join(f"- {c.name} ({c.data_type})" for c in t.columns)

        prompt = AIPromptTemplates.EXPLAIN_RELATIONSHIP.format(
            source_table=relationship.source_table,
            source_column=relationship.source_column,
            target_table=relationship.target_table,
            target_column=relationship.target_column,
            cardinality=relationship.cardinality.value if hasattr(relationship.cardinality, 'value') else str(relationship.cardinality),
            on_delete=relationship.on_delete or "NO ACTION",
            on_update=relationship.on_update or "NO ACTION",
            source_cols=source_cols or "(Columns not specified)",
            target_cols=target_cols or "(Columns not specified)"
        )

        return await self.llm.generate_response(
            system_prompt=AIPromptTemplates.CHAT_ASSISTANT_SYSTEM,
            user_prompt=prompt
        )

