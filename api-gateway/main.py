import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException

load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL")
STUDENT_SERVICE_URL = os.getenv("STUDENT_SERVICE_URL")
COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if not (AUTH_SERVICE_URL and STUDENT_SERVICE_URL and COURSE_SERVICE_URL):
    raise RuntimeError("Service URLs are missing. Add them to the .env file.")

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

METHODS = ["GET", "POST", "PUT", "DELETE"]


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return JSONResponse(status_code=404, content={"detail": "Route not found"})
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": message})


async def verify_token(request: Request):
    authorization = request.headers.get("authorization")
    if not authorization:
        return error_response(401, "Not authenticated")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/auth/me",
                headers={"authorization": authorization},
            )
    except httpx.RequestError:
        return error_response(503, "Auth service is unavailable")
    if response.status_code != 200:
        return error_response(401, "Invalid or expired token")
    return None


async def forward(request: Request, base_url: str, service_name: str):
    url = f"{base_url}{request.url.path}"
    body = await request.body()

    headers = {}
    if request.headers.get("content-type"):
        headers["content-type"] = request.headers["content-type"]
    if request.headers.get("authorization"):
        headers["authorization"] = request.headers["authorization"]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.request(
                request.method,
                url,
                params=request.query_params,
                content=body,
                headers=headers,
            )
    except httpx.ConnectError:
        return error_response(503, f"{service_name} is unavailable")
    except httpx.TimeoutException:
        return error_response(504, f"{service_name} took too long to respond")
    except httpx.RequestError:
        return error_response(502, f"Could not reach {service_name}")

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type"),
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "api-gateway"}


@app.api_route("/auth/{path:path}", methods=METHODS)
async def auth_proxy(request: Request, path: str):
    return await forward(request, AUTH_SERVICE_URL, "Auth service")


@app.api_route("/students", methods=METHODS)
@app.api_route("/students/{path:path}", methods=METHODS)
async def students_proxy(request: Request, path: str = ""):
    rejected = await verify_token(request)
    if rejected:
        return rejected
    return await forward(request, STUDENT_SERVICE_URL, "Student service")


@app.api_route("/courses", methods=METHODS)
@app.api_route("/courses/{path:path}", methods=METHODS)
async def courses_proxy(request: Request, path: str = ""):
    rejected = await verify_token(request)
    if rejected:
        return rejected
    return await forward(request, COURSE_SERVICE_URL, "Course service")