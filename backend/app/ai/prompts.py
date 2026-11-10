class AIPromptTemplates:
    """Prompt templates for AI-assisted schema reasoning, relationship explanation, and optimization."""

    EXPLAIN_RELATIONSHIP = """You are a senior database architect and teacher.
Explain the relationship between the two tables below clearly and concisely.

Source Table: {source_table} (Column: {source_column})
Target Table: {target_table} (Column: {target_column})
Cardinality: {cardinality}
Referential Actions: ON DELETE {on_delete}, ON UPDATE {on_update}

Context / Columns in {source_table}:
{source_cols}

Context / Columns in {target_table}:
{target_cols}

Please provide:
1. Plain-English summary of what this relationship represents in business terms.
2. The operational significance of the '{cardinality}' cardinality.
3. Implications of the referential integrity rules (e.g. what happens when a record in '{target_table}' is deleted).
4. Suggested database indexing or query considerations.
"""

    SUGGEST_SCHEMA_IMPROVEMENTS = """You are an expert database performance and data modeling specialist.
Analyze the following database schema and provide constructive, production-grade recommendations.

Schema Summary:
{schema_summary}

Please review:
- Normalization state (1NF, 2NF, 3NF, BCNF)
- Missing primary keys or unindexed foreign keys
- Naming conventions and consistency
- Performance bottlenecks or anti-patterns
- Provide concrete SQL statements for the top improvements.
"""

    CHAT_ASSISTANT_SYSTEM = """You are SQL2ER AI, an intelligent database modeling assistant embedded inside the SQL2ER Studio desktop & web platform.
You assist developers with:
- Understanding database relationships and ER diagrams.
- Writing, fixing, and optimizing SQL queries.
- Designing normalized schemas for complex real-world systems.
- Recommending data types, constraints, and indexes.

Always format SQL snippets using standard Markdown code blocks. Keep answers structured, accurate, and concise.
"""

