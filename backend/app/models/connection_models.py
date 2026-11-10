from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class DatabaseType(str, Enum):
    SQLITE = "sqlite"
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"

class DatabaseConnectionConfig(BaseModel):
    id: Optional[str] = None
    name: str
    db_type: DatabaseType
    host: Optional[str] = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    ssl_mode: Optional[str] = "prefer"
    file_path: Optional[str] = None  # for SQLite
    options: Dict[str, Any] = Field(default_factory=dict)

    def get_connection_string(self) -> str:
        if self.db_type == DatabaseType.SQLITE:
            path = self.file_path or self.database
            return f"sqlite:///{path}"
        elif self.db_type == DatabaseType.POSTGRESQL:
            port = self.port or 5432
            auth = f"{self.username}:{self.password}@" if self.username else ""
            return f"postgresql+psycopg2://{auth}{self.host}:{port}/{self.database}"
        elif self.db_type == DatabaseType.MYSQL:
            port = self.port or 3306
            auth = f"{self.username}:{self.password}@" if self.username else ""
            return f"mysql+pymysql://{auth}{self.host}:{port}/{self.database}"
        raise ValueError(f"Unsupported database type: {self.db_type}")

class QueryRequest(BaseModel):
    connection_id: Optional[str] = None
    connection_config: Optional[DatabaseConnectionConfig] = None
    query: str
    limit: int = 100
    offset: int = 0

