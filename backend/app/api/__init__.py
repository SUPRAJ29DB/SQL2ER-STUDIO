from fastapi import APIRouter
from .sql_routes import router as sql_router
from .upload_routes import router as upload_router
from .connection_routes import router as connection_router
from .database_routes import router as database_router
from .diagram_routes import router as diagram_router
from .ai_routes import router as ai_router

api_router = APIRouter()
api_router.include_router(sql_router, prefix="/sql", tags=["SQL Operations"])
api_router.include_router(upload_router, prefix="/upload", tags=["Uploads"])
api_router.include_router(connection_router, prefix="/connections", tags=["Database Connections"])
api_router.include_router(database_router, prefix="/database", tags=["Database Introspection"])
api_router.include_router(diagram_router, prefix="/diagram", tags=["Diagram & Layout"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Assistance"])

__all__ = ["api_router"]

