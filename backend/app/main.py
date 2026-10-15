from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import DigitalSaathiException
from backend.app.db.session import init_db

# Routers
from backend.app.api.routes.auth import router as auth_router
from backend.app.api.routes.assistant import router as assistant_router
from backend.app.api.routes.voice import router as voice_router
from backend.app.api.routes.documents import router as documents_router
from backend.app.api.routes.forms import router as forms_router
from backend.app.api.routes.scams import router as scams_router
from backend.app.api.routes.preferences import router as preferences_router
from backend.app.api.routes.history import router as history_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Digital Saathi Application...")
    # Initialize database tables on startup
    await init_db()
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down Digital Saathi Application.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Voice-First Digital Accessibility and Safety Assistant (डिजिटल साथी)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS + ["*"],  # Accommodates local development & network devices
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handler
@app.exception_handler(DigitalSaathiException)
async def digital_saathi_exception_handler(request: Request, exc: DigitalSaathiException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail), "code": "ERROR"}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred. Please try again.", "code": "INTERNAL_SERVER_ERROR"}
    )

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER
    }

# Register API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(assistant_router, prefix=api_v1_prefix)
app.include_router(voice_router, prefix=api_v1_prefix)
app.include_router(documents_router, prefix=api_v1_prefix)
app.include_router(forms_router, prefix=api_v1_prefix)
app.include_router(scams_router, prefix=api_v1_prefix)
app.include_router(preferences_router, prefix=api_v1_prefix)
app.include_router(history_router, prefix=api_v1_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
