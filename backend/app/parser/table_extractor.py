import re
from typing import List, Dict, Any, Tuple

class TableExtractor:
    """Extracts CREATE TABLE blocks and basic table metadata from SQL DDL."""

    @staticmethod
    def clean_identifier(name: str) -> str:
        """Strip quotes, backticks, brackets and whitespace."""
        return re.sub(r'[`"\[\]]', '', name.strip())

    @staticmethod
    def extract_table_blocks(sql_script: str) -> List[Tuple[str, str, str]]:
        """
        Parses SQL text into list of (schema_name, table_name, body_inside_parentheses).
        Handles nested parentheses, quotes, and comments.
        """
        # Remove comments first
        cleaned_sql = re.sub(r'--.*?$', '', sql_script, flags=re.MULTILINE)
        cleaned_sql = re.sub(r'/\*.*?\*/', '', cleaned_sql, flags=re.DOTALL)

        tables = []
        pattern = re.compile(
            r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\.)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(',
            re.IGNORECASE
        )

        for match in pattern.finditer(cleaned_sql):
            schema_name = match.group(1) or "public"
            table_name = match.group(2)
            start_idx = match.end()

            # Find matching closing parenthesis
            paren_count = 1
            idx = start_idx
            in_quote = None

            while idx < len(cleaned_sql) and paren_count > 0:
                char = cleaned_sql[idx]
                if char in ("'", '"') and (idx == 0 or cleaned_sql[idx - 1] != '\\'):
                    if in_quote == char:
                        in_quote = None
                    elif in_quote is None:
                        in_quote = char
                elif not in_quote:
                    if char == '(':
                        paren_count += 1
                    elif char == ')':
                        paren_count -= 1
                idx += 1

            if paren_count == 0:
                body = cleaned_sql[start_idx:idx - 1]
                tables.append((schema_name, table_name, body))

        return tables

