import re
from typing import List, Tuple

class SQLValidator:
    """Validates SQL query syntax and structural correctness."""

    @staticmethod
    def validate_syntax(query: str) -> Tuple[bool, List[str]]:
        errors = []
        if not query or not query.strip():
            return False, ["Query is empty."]

        # Check balanced parentheses
        paren_depth = 0
        in_quote = None
        for i, char in enumerate(query):
            if char in ("'", '"'):
                if in_quote == char:
                    in_quote = None
                elif in_quote is None:
                    in_quote = char
            elif not in_quote:
                if char == '(':
                    paren_depth += 1
                elif char == ')':
                    paren_depth -= 1
                    if paren_depth < 0:
                        errors.append(f"Unmatched closing parenthesis at position {i}.")
                        break

        if paren_depth > 0:
            errors.append("Unclosed opening parenthesis detected.")
        if in_quote:
            errors.append(f"Unclosed string literal starting with {in_quote}.")

        return len(errors) == 0, errors

