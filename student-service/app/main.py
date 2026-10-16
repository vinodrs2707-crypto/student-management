from typing import List

from fastapi import Depends, FastAPI, HTTPException, Response
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Service")


def get_student_or_404(student_id: int, db: Session) -> models.Student:
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/students", response_model=schemas.StudentOut, status_code=201)
def create_student(data: schemas.StudentCreate, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(models.Student).filter(models.Student.email == email).first():
        raise HTTPException(status_code=400, detail="A student with this email already exists")
    student = models.Student(
        name=data.name,
        email=email,
        phone=data.phone,
        department=data.department,
        course=data.course,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@app.get("/students", response_model=List[schemas.StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.query(models.Student).all()


@app.get("/students/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    return get_student_or_404(student_id, db)


@app.put("/students/{student_id}", response_model=schemas.StudentOut)
def update_student(student_id: int, data: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = get_student_or_404(student_id, db)
    changes = data.model_dump(exclude_unset=True)

    if "email" in changes and changes["email"] is not None:
        new_email = changes["email"].lower()
        other = db.query(models.Student).filter(
            models.Student.email == new_email, models.Student.id != student_id
        ).first()
        if other:
            raise HTTPException(status_code=400, detail="A student with this email already exists")
        changes["email"] = new_email

    for field, value in changes.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = get_student_or_404(student_id, db)
    db.delete(student)
    db.commit()
    return Response(status_code=204)