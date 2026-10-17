@echo off
start "Auth Service" cmd /k "cd /d %~dp0auth-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8004"
start "Student Service" cmd /k "cd /d %~dp0student-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8001"
start "Course Service" cmd /k "cd /d %~dp0course-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8002"
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && venv\Scripts\activate && uvicorn main:app --reload --port 8000"