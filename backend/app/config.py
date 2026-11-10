import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SQL2ER STUDIO API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    
    SECRET_KEY: str = "sql2er_super_secret_development_key"
    ALLOWED_ORIGINS: str = "*"

    # AI Configuration
    LLM_PROVIDER: str = "offline"  # offline, openai, gemini, anthropic, ollama
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"

    # Export & storage
    EXPORTS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../exports"))
    MAX_UPLOAD_SIZE_MB: int = 50

    @property
    def cors_origins(self) -> List[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

settings = Settings()

