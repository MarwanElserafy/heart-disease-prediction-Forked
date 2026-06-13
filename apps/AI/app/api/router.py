from fastapi import APIRouter

from app.api.endpoints import internal_gateway, internal_ecg

api_router = APIRouter()

# All ML / prediction / SHAP / report traffic must go through the Node gateway + X-INTERNAL-API-KEY
api_router.include_router(internal_gateway.router)
api_router.include_router(internal_ecg.router)
