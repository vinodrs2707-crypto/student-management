import os
from typing import List

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, get_db

load_dotenv()

STUDENT_SERVICE_URL = os.getenv("STUDENT_SERVICE_URL")
if not STUDENT_SERVICE_URL:
    raise RuntimeError("STUDENT_SERVICE_URL is missing. Add it to the .env file.")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Course Service")


def get_course_or_404(course_id: int, db: Session) -> models.Course:
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


def fetch_student(student_id: int):
    try:
        response = httpx.get(f"{STUDENT_SERVICE_URL}/students/{student_id}", timeout=5)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Student service is unavailable")
    if response.status_code == 404:
        return None
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Student service returned an error")
    return response.json()


@app.post("/courses", response_model=schemas.CourseOut, status_code=201)
def create_course(data: schemas.CourseCreate, db: Session = Depends(get_db)):
    code = data.code.upper()
    if db.query(models.Course).filter(models.Course.code == code).first():
        raise HTTPException(status_code=400, detail="A course with this code already exists")
    course = models.Course(name=data.name, code=code, description=data.description)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.get("/courses", response_model=List[schemas.CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()


@app.get("/courses/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    return get_course_or_404(course_id, db)


@app.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(course_id: int, data: schemas.CourseUpdate, db: Session = Depends(get_db)):
    course = get_course_or_404(course_id, db)
    changes = data.model_dump(exclude_unset=True)

    if "code" in changes and changes["code"] is not None:
        new_code = changes["code"].upper()
        other = db.query(models.Course).filter(
            models.Course.code == new_code, models.Course.id != course_id
        ).first()
        if other:
            raise HTTPException(status_code=400, detail="A course with this code already exists")
        changes["code"] = new_code

    for field, value in changes.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course


@app.delete("/courses/{course_id}", status_code=204)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = get_course_or_404(course_id, db)
    db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).delete()
    db.delete(course)
    db.commit()
    return Response(status_code=204)


@app.post("/courses/{course_id}/students", response_model=schemas.EnrollmentOut, status_code=201)
def enroll_student(course_id: int, data: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    get_course_or_404(course_id, db)

    if fetch_student(data.student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.student_id == data.student_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student is already enrolled in this course")

    enrollment = models.Enrollment(course_id=course_id, student_id=data.student_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@app.get("/courses/{course_id}/students", response_model=List[schemas.StudentInfo])
def list_course_students(course_id: int, db: Session = Depends(get_db)):
    get_course_or_404(course_id, db)
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()

    students = []
    for enrollment in enrollments:
        student = fetch_student(enrollment.student_id)
        if student is not None:
            students.append(student)
    return students