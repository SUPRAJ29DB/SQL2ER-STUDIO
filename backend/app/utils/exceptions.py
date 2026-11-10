from typing import Optional

class SQL2ERException(Exception):
    """Base exception for all SQL2ER errors"""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class ParsingException(SQL2ERException):
    """Raised when SQL parsing fails"""
    def __init__(self, message: str, line: Optional[int] = None, column: Optional[int] = None):
        super().__init__(message, code="PARSER_ERROR", details={"line": line, "column": column})
        self.line = line
        self.column = column

class DatabaseConnectionException(SQL2ERException):
    """Raised when database connection or execution fails"""
    def __init__(self, message: str, db_type: Optional[str] = None):
        super().__init__(message, code="DB_CONNECTION_ERROR", details={"db_type": db_type})
        self.db_type = db_type

class SchemaValidationException(SQL2ERException):
    """Raised when schema validation violates relational rules"""
    def __init__(self, message: str, errors: Optional[list] = None):
        super().__init__(message, code="SCHEMA_VALIDATION_ERROR", details={"errors": errors or []})
        self.errors = errors or []

class AIProviderException(SQL2ERException):
    """Raised when external AI/LLM API fails"""
    def __init__(self, message: str, provider: str):
        super().__init__(message, code="AI_PROVIDER_ERROR", details={"provider": provider})
        self.provider = provider

