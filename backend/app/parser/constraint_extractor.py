import re
from typing import List, Tuple, Dict, Any
from app.models.schema_models import ForeignKeyDefinition, IndexDefinition

class ConstraintExtractor:
    """Extracts table-level and ALTER TABLE foreign keys, primary keys, and unique constraints."""

    @staticmethod
    def clean_identifier(name: str) -> str:
        return re.sub(r'[`"\[\]]', '', name.strip())

    @classmethod
    def extract_table_constraints(cls, table_name: str, body: str) -> Tuple[List[str], List[ForeignKeyDefinition], List[IndexDefinition]]:
        """
        Extracts primary keys, foreign keys, and indexes defined inside the CREATE TABLE body.
        """
        primary_keys = []
        foreign_keys = []
        indexes = []

        # Split body by commas that are outside parentheses
        statements = []
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
                    statements.append("".join(cur).strip())
                    cur = []
                    continue
            cur.append(char)
        if cur:
            statements.append("".join(cur).strip())

        for stmt in statements:
            stmt_upper = stmt.upper()

            # 1. PRIMARY KEY (col1, col2)
            pk_match = re.search(r'(?:CONSTRAINT\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)', stmt, re.IGNORECASE)
            if pk_match:
                cols = [cls.clean_identifier(c) for c in pk_match.group(2).split(',')]
                primary_keys.extend(cols)
                continue

            # 2. FOREIGN KEY (col) REFERENCES ref_table (ref_col)
            fk_match = re.search(
                r'(?:CONSTRAINT\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([^)]+)\)(?:.*?\bON\s+DELETE\s+([A-Za-z ]+?)(?=\s+ON|\s*$))?(?:.*?\bON\s+UPDATE\s+([A-Za-z ]+?)(?=\s+ON|\s*$))?',
                stmt,
                re.IGNORECASE
            )
            if fk_match:
                fk_name = fk_match.group(1) or f"fk_{table_name}_{fk_match.group(3)}"
                constrained_cols = [cls.clean_identifier(c) for c in fk_match.group(2).split(',')]
                ref_table = cls.clean_identifier(fk_match.group(3))
                ref_cols = [cls.clean_identifier(c) for c in fk_match.group(4).split(',')]
                on_delete = fk_match.group(5).strip().upper() if fk_match.group(5) else "NO ACTION"
                on_update = fk_match.group(6).strip().upper() if fk_match.group(6) else "NO ACTION"

                foreign_keys.append(ForeignKeyDefinition(
                    name=fk_name,
                    constrained_columns=constrained_cols,
                    referred_table=ref_table,
                    referred_columns=ref_cols,
                    on_delete=on_delete,
                    on_update=on_update
                ))
                continue

            # 3. UNIQUE (col1, col2)
            uq_match = re.search(r'(?:CONSTRAINT\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+)?UNIQUE(?:\s+KEY)?\s*\(([^)]+)\)', stmt, re.IGNORECASE)
            if uq_match:
                uq_name = uq_match.group(1) or f"uq_{table_name}"
                cols = [cls.clean_identifier(c) for c in uq_match.group(2).split(',')]
                indexes.append(IndexDefinition(name=uq_name, columns=cols, is_unique=True))

        return primary_keys, foreign_keys, indexes

    @classmethod
    def extract_alter_table_foreign_keys(cls, sql_script: str) -> List[Tuple[str, ForeignKeyDefinition]]:
        """
        Extracts ALTER TABLE [table] ADD CONSTRAINT ... FOREIGN KEY ... statements.
        Returns list of (source_table, ForeignKeyDefinition).
        """
        results = []
        alter_pattern = re.compile(
            r'ALTER\s+TABLE\s+(?:ONLY\s+)?(?:[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\.)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+ADD\s+(?:CONSTRAINT\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(?:[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\.)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([^)]+)\)(?:.*?\bON\s+DELETE\s+([A-Za-z ]+?)(?=\s+ON|\s*;|$))?(?:.*?\bON\s+UPDATE\s+([A-Za-z ]+?)(?=\s+ON|\s*;|$))?',
            re.IGNORECASE
        )

        for match in alter_pattern.finditer(sql_script):
            source_table = cls.clean_identifier(match.group(2))
            fk_name = match.group(3) or f"fk_{source_table}_{match.group(6)}"
            constrained_cols = [cls.clean_identifier(c) for c in match.group(4).split(',')]
            ref_table = cls.clean_identifier(match.group(6))
            ref_cols = [cls.clean_identifier(c) for c in match.group(7).split(',')]
            on_delete = match.group(8).strip().upper() if match.group(8) else "NO ACTION"
            on_update = match.group(9).strip().upper() if match.group(9) else "NO ACTION"

            results.append((
                source_table,
                ForeignKeyDefinition(
                    name=fk_name,
                    constrained_columns=constrained_cols,
                    referred_table=ref_table,
                    referred_columns=ref_cols,
                    on_delete=on_delete,
                    on_update=on_update
                )
            ))

        return results

