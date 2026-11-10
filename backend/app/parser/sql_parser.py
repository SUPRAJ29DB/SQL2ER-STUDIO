import re
from typing import List, Dict, Optional
from app.models.schema_models import SchemaDefinition, TableDefinition, ColumnDefinition
from app.parser.table_extractor import TableExtractor
from app.parser.column_extractor import ColumnExtractor
from app.parser.constraint_extractor import ConstraintExtractor
from app.parser.relationship_extractor import RelationshipExtractor
from app.utils.exceptions import ParsingException

class SQLParser:
    """
    Core SQL DDL Parser for SQL2ER.
    Parses arbitrary SQL scripts (PostgreSQL, MySQL, SQLite, T-SQL, ANSI standard)
    into a structured SchemaDefinition.
    """

    def __init__(self, dialect: str = "standard"):
        self.dialect = dialect

    def parse(self, sql_script: str) -> SchemaDefinition:
        """Parses DDL text and returns a validated SchemaDefinition."""
        if not sql_script or not sql_script.strip():
            return SchemaDefinition(tables=[], relationships=[])

        try:
            # 1. Extract raw CREATE TABLE blocks
            raw_tables = TableExtractor.extract_table_blocks(sql_script)

            parsed_tables: List[TableDefinition] = []

            for schema_name, table_name, body in raw_tables:
                columns: List[ColumnDefinition] = []

                # Split body into lines/clauses
                clauses = self._split_clauses(body)

                for clause in clauses:
                    col_def = ColumnExtractor.parse_column_line(clause)
                    if col_def:
                        columns.append(col_def)

                # Extract table-level constraints
                primary_keys, foreign_keys, indexes = ConstraintExtractor.extract_table_constraints(table_name, body)

                # Apply PK flag to columns if found in table-level PRIMARY KEY (col1, col2)
                for col in columns:
                    if col.name in primary_keys:
                        col.is_primary_key = True
                        col.is_nullable = False

                # Apply FK flags from table-level foreign keys
                for fk in foreign_keys:
                    for col_name in fk.constrained_columns:
                        for col in columns:
                            if col.name.lower() == col_name.lower():
                                col.is_foreign_key = True
                                col.references_table = fk.referred_table
                                col.references_column = fk.referred_columns[0] if fk.referred_columns else "id"

                # If primary_keys list was empty but columns had inline PK:
                inline_pks = [c.name for c in columns if c.is_primary_key]
                all_pks = list(set(primary_keys + inline_pks))

                parsed_tables.append(TableDefinition(
                    name=table_name,
                    schema_name=schema_name,
                    columns=columns,
                    primary_keys=all_pks,
                    foreign_keys=foreign_keys,
                    indexes=indexes
                ))

            # 2. Extract external ALTER TABLE foreign keys
            alter_fks = ConstraintExtractor.extract_alter_table_foreign_keys(sql_script)
            table_dict = {t.name.lower(): t for t in parsed_tables}

            for source_table, fk in alter_fks:
                if source_table.lower() in table_dict:
                    t = table_dict[source_table.lower()]
                    t.foreign_keys.append(fk)
                    for col_name in fk.constrained_columns:
                        for col in t.columns:
                            if col.name.lower() == col_name.lower():
                                col.is_foreign_key = True
                                col.references_table = fk.referred_table
                                col.references_column = fk.referred_columns[0] if fk.referred_columns else "id"

            # 3. Extract Relationships
            relationships = RelationshipExtractor.build_relationships(parsed_tables)

            return SchemaDefinition(
                database_name="imported_schema",
                dialect=self.dialect,
                tables=parsed_tables,
                relationships=relationships
            )

        except Exception as e:
            raise ParsingException(f"Failed to parse SQL script: {str(e)}")

    def _split_clauses(self, body: str) -> List[str]:
        clauses = []
        cur = []
        paren_depth = 0
        in_quote = None
        for char in body:
            if char in ("'", '"'):
                in_quote = None if in_quote == char else char
            elif not in_quote:
                if char == '(':
                    paren_depth += 1
                elif char == ')':
                    paren_depth -= 1
                elif char == ',' and paren_depth == 0:
                    stmt = "".join(cur).strip()
                    if stmt:
                        clauses.append(stmt)
                    cur = []
                    continue
            cur.append(char)
        if cur:
            stmt = "".join(cur).strip()
            if stmt:
                clauses.append(stmt)
        return clauses

