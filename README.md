\# Student Management System (Microservices)



A Student Management System built with a microservices architecture. Users can register, log in, manage students and courses, and enroll students in courses. The React frontend talks only to the API Gateway, and the gateway forwards requests to independent FastAPI services.



\## Architecture



```

React Frontend (http://localhost:5173)

&#x20;       |

&#x20;       v

API Gateway (port 8000)  -- checks the JWT token with the Auth Service

&#x20;       |

&#x20;       +--> Auth Service     (port 8004, auth.db)

&#x20;       +--> Student Service  (port 8001, students.db)

&#x20;       +--> Course Service   (port 8002, courses.db)

&#x20;                                |

&#x20;                                +--> asks the Student Service to confirm a student exists

```



\- \*\*Auth Service\*\*: registration, login, JWT creation and token validation (`/auth/me`).

\- \*\*Student Service\*\*: student CRUD.

\- \*\*Course Service\*\*: course CRUD, enrolling students in courses, and listing the students in a course. It stores only student IDs and asks the Student Service for student details.

\- \*\*API Gateway\*\*: single entry point for the frontend. Routes `/auth/\*`, `/students\*` and `/courses\*`, verifies the Bearer token for students and courses, and returns clear errors for invalid routes (404) and unavailable services (503, 504).

\- \*\*Frontend\*\*: React (Vite) app with register, login, dashboard, students and courses pages.



Each backend service has its own FastAPI app and its own SQLite database.



\## Tech stack



\- Frontend: React.js, HTML, CSS, JavaScript (Vite, axios, react-router-dom)

\- Backend: Python with FastAPI

\- Database: SQLite (one database per service)

\- Authentication: JWT (PyJWT) with bcrypt password hashing

\- API testing: Postman

\- Version control: Git and GitHub



\## Project structure



```

student-management/

├── frontend/          React app (src/components, src/pages, src/services, App.jsx)

├── api-gateway/       main.py, requirements.txt

├── auth-service/      app/ (main.py, models.py, schemas.py, security.py, database.py)

├── student-service/   app/ (main.py, models.py, schemas.py, database.py)

├── course-service/    app/ (main.py, models.py, schemas.py, database.py)

├── postman/           collection.json

├── run-all.bat        starts all four backend services (Windows)

└── README.md

```



\## Prerequisites



\- Python 3.11 or newer

\- Node.js 18 or newer

\- Git



\## Environment variables



Copy each `.env.example` file to `.env` and adjust the values. The `.env` files are not committed to Git.



| Service | Variable | Description |

|---|---|---|

| auth-service | `SECRET\_KEY` | Secret used to sign JWT tokens. Use a long random string. |

| auth-service | `ALGORITHM` | JWT algorithm (`HS256`). |

| auth-service | `ACCESS\_TOKEN\_EXPIRE\_MINUTES` | Token lifetime in minutes (`60`). |

| course-service | `STUDENT\_SERVICE\_URL` | Address of the Student Service (`http://127.0.0.1:8001`). |

| api-gateway | `AUTH\_SERVICE\_URL` | Address of the Auth Service (`http://127.0.0.1:8004`). |

| api-gateway | `STUDENT\_SERVICE\_URL` | Address of the Student Service (`http://127.0.0.1:8001`). |

| api-gateway | `COURSE\_SERVICE\_URL` | Address of the Course Service (`http://127.0.0.1:8002`). |

| api-gateway | `FRONTEND\_URL` | Allowed frontend origin for CORS (`http://localhost:5173`). |

| frontend | `VITE\_API\_URL` | Address of the API Gateway (`http://127.0.0.1:8000`). |



To generate a secret key:



```

python -c "import secrets; print(secrets.token\_hex(32))"

```



\## Setup and run



Clone the repository:



```

git clone https://github.com/vinodrs2707-crypto/student-management.git

cd student-management

```



\### 1. Auth Service (port 8004)



```

cd auth-service

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

copy .env.example .env

```



Open `.env` and replace `SECRET\_KEY` with your own random key. Then run:



```

uvicorn app.main:app --reload --port 8004

```



\### 2. Student Service (port 8001)



```

cd student-service

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8001

```



\### 3. Course Service (port 8002)



```

cd course-service

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

copy .env.example .env

uvicorn app.main:app --reload --port 8002

```



\### 4. API Gateway (port 8000)



```

cd api-gateway

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

copy .env.example .env

uvicorn main:app --reload --port 8000

```



\### 5. Frontend (port 5173)



```

cd frontend

npm install

copy .env.example .env

npm run dev

```



Open http://localhost:5173 in your browser.



\### Start all backend services at once (Windows)



After setting up the four virtual environments and `.env` files above, run this from the project root:



```

run-all.bat

```



It opens one window for each backend service.



\## API documentation (Swagger UI)



Each FastAPI service provides interactive documentation:



\- Auth Service: http://127.0.0.1:8004/docs

\- Student Service: http://127.0.0.1:8001/docs

\- Course Service: http://127.0.0.1:8002/docs



The frontend and Postman use the gateway at http://127.0.0.1:8000.



\## API endpoints (through the gateway)



Auth (no token needed for register and login):



| Method | Path | Description |

|---|---|---|

| POST | `/auth/register` | Register a new user |

| POST | `/auth/login` | Log in and get a JWT access token |

| GET | `/auth/me` | Get the logged-in user |



Students (Bearer token required):



| Method | Path | Description |

|---|---|---|

| POST | `/students` | Create a student |

| GET | `/students` | List all students |

| GET | `/students/{student\_id}` | Get one student |

| PUT | `/students/{student\_id}` | Update a student |

| DELETE | `/students/{student\_id}` | Delete a student |



Courses (Bearer token required):



| Method | Path | Description |

|---|---|---|

| POST | `/courses` | Create a course |

| GET | `/courses` | List all courses |

| GET | `/courses/{course\_id}` | Get one course |

| PUT | `/courses/{course\_id}` | Update a course |

| DELETE | `/courses/{course\_id}` | Delete a course and its enrollments |

| POST | `/courses/{course\_id}/students` | Enroll a student (`{"student\_id": 1}`) |

| GET | `/courses/{course\_id}/students` | List the students enrolled in a course |



Error responses: `401` (missing or invalid token), `404` (not found or invalid route), `400` (duplicate data), `422` (validation error), `503` (a service is unavailable).



\## Testing with Postman



1\. Open Postman and import `postman/collection.json`.

2\. Start all services.

3\. Send \*\*Register\*\*, then \*\*Login\*\*. The Login request saves the token automatically in the `token` collection variable.

4\. Send any other request. They use `{{token}}` as the Bearer token.



Tokens expire after 60 minutes, so run \*\*Login\*\* again if you get a 401 error.



\## Screenshots



| Screen | File |

|---|---|

| Register page | `screenshots/01-register.png` |

| Login page | `screenshots/02-login.png` |

| Dashboard | `screenshots/03-dashboard.png` |

| Students page | `screenshots/04-students.png` |

| Courses page | `screenshots/05-courses.png` |

| Course enrollment panel | `screenshots/06-enrollment.png` |

| Swagger UI: Auth Service login | `screenshots/07-swagger-auth.png` |
| Swagger UI: Student Service | `screenshots/07-swagger-students.png` |
| Swagger UI: Course Service | `screenshots/07-swagger-courses.png` |



\## Notes



\- Each service owns its own database. The Course Service stores only student IDs and asks the Student Service for student details.

\- Passwords are stored as bcrypt hashes. Secrets are read from environment variables and never hardcoded.

\- Database files (`\*.db`), virtual environments, `node\_modules` and `.env` files are excluded from Git.

