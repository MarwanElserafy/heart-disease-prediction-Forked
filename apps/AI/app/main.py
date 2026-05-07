from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from api.router import api_router
from db.database import engine, Base
import uvicorn

app = FastAPI(title="Heart Disease Prediction API")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail, "details": []},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal Server Error", "details": []},
    )

# Start Application Routing
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
