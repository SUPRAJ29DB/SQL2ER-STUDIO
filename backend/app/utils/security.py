import re

DANGEROUS_SQL_PATTERNS = [
    r";\s*SHUTDOWN\b",
    r";\s*EXEC\b",
    r";\s*DROP\s+DATABASE\b",
    r";\s*GRANT\b",
    r";\s*REVOKE\b"
]

def sanitize_sql_identifier(identifier: str) -> str:
    """Sanitize table or column names to prevent SQL injection in DDL generators."""
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '', identifier.strip())
    if not cleaned:
        raise ValueError("Invalid identifier: contains no valid alphanumeric or underscore characters")
    return cleaned

def validate_safe_query(query: str, read_only: bool = False) -> bool:
    """Check query for malicious commands or forbidden multi-statement injection."""
    query_upper = query.strip().upper()
    for pattern in DANGEROUS_SQL_PATTERNS:
        if re.search(pattern, query_upper):
            return False
            
    if read_only:
        disallowed = ["DROP", "TRUNCATE", "ALTER", "INSERT", "UPDATE", "DELETE", "GRANT", "REVOKE"]
        first_token = query_upper.split()[0] if query_upper.split() else ""
        if first_token in disallowed:
            return False

    return True

