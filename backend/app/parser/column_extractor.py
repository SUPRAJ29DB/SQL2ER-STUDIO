import re
from typing import List, Tuple, Optional
from app.models.schema_models import ColumnDefinition

class ColumnExtractor:
    """Extracts column definitions, types, primary keys, and inline constraints."""

    COMMON_TYPES = [
        "VARCHAR", "CHAR", "TEXT", "INT", "INTEGER", "BIGINT", "SMALLINT",
        "TINYINT", "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "REAL", "BOOLEAN",
        "BOOL", "DATE", "TIME", "TIMESTAMP", "TIMESTAMPTZ", "DATETIME", "UUID",
        "JSON", "JSONB", "BLOB", "BYTEA", "SERIAL", "BIGSERIAL"
    ]

    @staticmethod
    def clean_identifier(name: str) -> str:
        return re.sub(r'[`"\[\]]', '', name.strip())

    @classmethod
    def parse_column_line(cls, line: str) -> Optional[ColumnDefinition]:
        """
        Parses a single SQL line representing a column definition into ColumnDefinition.
        Returns None if the line is a table-level constraint (e.g. PRIMARY KEY, FOREIGN KEY, CONSTRAINT, INDEX).
        """
        line_clean = line.strip()
        if not line_clean:
            return None

        # Ignore table-level constraints
        upper_line = line_clean.upper()
        if any(upper_line.startswith(prefix) for prefix in [
            "PRIMARY KEY", "FOREIGN KEY", "CONSTRAINT", "UNIQUE", "CHECK", "INDEX", "KEY"
        ]):
            return None

        # Match: col_name data_type(size,...) [modifiers]
        match = re.match(r'^[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+([a-zA-Z0-9_]+(?:\s*\([^)]*\))?)(.*)$', line_clean, re.IGNORECASE)
        if not match:
            return None

        col_name = cls.clean_identifier(match.group(1))
        data_type = match.group(2).strip().upper()
        rest = match.group(3).strip()

        is_pk = bool(re.search(r'\bPRIMARY\s+KEY\b', rest, re.IGNORECASE))
        is_unique = bool(re.search(r'\bUNIQUE\b', rest, re.IGNORECASE))
        is_not_null = bool(re.search(r'\bNOT\s+NULL\b', rest, re.IGNORECASE))
        is_nullable = not (is_not_null or is_pk)
        is_auto_increment = bool(re.search(r'\b(AUTO_INCREMENT|SERIAL|BIGSERIAL|IDENTITY)\b', f"{data_type} {rest}", re.IGNORECASE))

        # Check default value
        default_val = None
        default_match = re.search(r'\bDEFAULT\s+([^,]+)', rest, re.IGNORECASE)
        if default_match:
            default_val = default_match.group(1).strip()

        # Check inline REFERENCES
        ref_table = None
        ref_column = None
        ref_match = re.search(r'\bREFERENCES\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*(?:\([`"\[]?([a-zA-Z0-9_]+)[`"\]]?\))?', rest, re.IGNORECASE)
        if ref_match:
            ref_table = cls.clean_identifier(ref_match.group(1))
            ref_column = cls.clean_identifier(ref_match.group(2)) if ref_match.group(2) else "id"

        return ColumnDefinition(
            name=col_name,
            data_type=data_type,
            is_primary_key=is_pk,
            is_foreign_key=bool(ref_table),
            is_nullable=is_nullable,
            is_unique=is_unique,
            is_auto_increment=is_auto_increment,
            default_value=default_val,
            references_table=ref_table,
            references_column=ref_column
        )

