from fastapi import APIRouter

from api.endpoints import internal_gateway

api_router = APIRouter()

# All ML / prediction / SHAP / report traffic must go through the Node gateway + X-INTERNAL-API-KEY
api_router.include_router(internal_gateway.router)
