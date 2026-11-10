from typing import List, Dict, Any, Set
from app.models.schema_models import SchemaDefinition, TableDefinition
from app.models.response_models import AISuggestionItem, AISuggestionResponse

class SchemaAnalyzer:
    """Performs static analysis on schemas to identify best practice violations and calculate quality score."""

    @classmethod
    def analyze(cls, schema: SchemaDefinition) -> AISuggestionResponse:
        suggestions: List[AISuggestionItem] = []
        score = 100

        tables = schema.tables
        table_names = {t.name.lower(): t for t in tables}
        referenced_tables: Set[str] = set()
        referencing_tables: Set[str] = set()

        for t in tables:
            # 1. Missing Primary Key
            has_pk = bool(t.primary_keys) or any(c.is_primary_key for c in t.columns)
            if not has_pk:
                score -= 10
                suggestions.append(AISuggestionItem(
                    type="missing_pk",
                    severity="critical",
                    table=t.name,
                    title="Missing Primary Key",
                    description=f"Table '{t.name}' does not have a primary key defined. Every relational table should have a unique identifier.",
                    recommended_sql=f"ALTER TABLE {t.name} ADD COLUMN id SERIAL PRIMARY KEY;"
                ))

            # 2. Check for missing indexes on foreign key columns
            indexed_columns = set()
            for idx in t.indexes:
                for c in idx.columns:
                    indexed_columns.add(c.lower())

            for fk in t.foreign_keys:
                referencing_tables.add(t.name.lower())
                referenced_tables.add(fk.referred_table.lower())
                for c in fk.constrained_columns:
                    if c.lower() not in indexed_columns and not any(col.is_primary_key for col in t.columns if col.name.lower() == c.lower()):
                        score -= 3
                        suggestions.append(AISuggestionItem(
                            type="index_needed",
                            severity="warning",
                            table=t.name,
                            column=c,
                            title="Unindexed Foreign Key Column",
                            description=f"Foreign key '{c}' in '{t.name}' lacks an index. This can degrade JOIN performance and cause table-level locking.",
                            recommended_sql=f"CREATE INDEX idx_{t.name}_{c} ON {t.name} ({c});"
                        ))

            # 3. Detect Potential Missing Foreign Keys based on naming convention (_id)
            for col in t.columns:
                col_name = col.name.lower()
                if col_name.endswith("_id") and not col.is_primary_key and not col.is_foreign_key:
                    candidate_target = col_name[:-3]
                    # check plural or singular in table_names
                    plural_candidate = candidate_target + "s"
                    target = None
                    if candidate_target in table_names:
                        target = candidate_target
                    elif plural_candidate in table_names:
                        target = plural_candidate

                    if target and target != t.name.lower():
                        score -= 5
                        suggestions.append(AISuggestionItem(
                            type="missing_fk",
                            severity="warning",
                            table=t.name,
                            column=col.name,
                            title="Potential Missing Foreign Key",
                            description=f"Column '{col.name}' in '{t.name}' appears to reference table '{target}', but no foreign key constraint was found.",
                            recommended_sql=f"ALTER TABLE {t.name} ADD CONSTRAINT fk_{t.name}_{col.name} FOREIGN KEY ({col.name}) REFERENCES {target}(id);"
                        ))

            # 4. Inconsistent Column Naming / reserved words
            for col in t.columns:
                if col.name.lower() in ["order", "user", "group", "select", "table", "limit"]:
                    score -= 2
                    suggestions.append(AISuggestionItem(
                        type="naming_convention",
                        severity="info",
                        table=t.name,
                        column=col.name,
                        title="SQL Keyword Used as Identifier",
                        description=f"Column '{col.name}' in '{t.name}' is an SQL reserved keyword. Consider renaming it to avoid syntax errors and quoting requirements.",
                        recommended_sql=f"-- Rename '{col.name}' to a more descriptive name, e.g. '{col.name}_val'"
                    ))

        # 5. Detect Orphaned Tables (no incoming or outgoing relationships)
        if len(tables) > 1:
            for t in tables:
                t_lower = t.name.lower()
                if t_lower not in referenced_tables and t_lower not in referencing_tables:
                    score -= 2
                    suggestions.append(AISuggestionItem(
                        type="orphan_table",
                        severity="info",
                        table=t.name,
                        title="Isolated / Orphan Table",
                        description=f"Table '{t.name}' has no foreign keys connected to any other tables in the schema.",
                        recommended_sql=None
                    ))

        score = max(10, min(100, score))
        summary = f"Database Health Score: {score}/100. Found {len(suggestions)} optimization suggestion(s)."

        return AISuggestionResponse(
            suggestions=suggestions,
            quality_score=score,
            summary=summary
        )

