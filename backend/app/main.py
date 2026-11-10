import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api import api_router
from app.utils.exceptions import SQL2ERException

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SQL2ER STUDIO - Interactive SQL to Entity Relationship Diagramming & Database Intelligence Engine",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handler
@app.exception_handler(SQL2ERException)
async def sql2er_exception_handler(request: Request, exc: SQL2ERException):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": exc.message,
            "errors": [{"code": exc.code, "message": exc.message, "details": exc.details}]
        }
    )

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Mount modular API routes
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=settings.DEBUG)

