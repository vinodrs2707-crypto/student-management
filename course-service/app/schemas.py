from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class CourseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=20)
    description: Optional[str] = Field(default=None, max_length=500)


class CourseUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    code: Optional[str] = Field(default=None, min_length=2, max_length=20)
    description: Optional[str] = Field(default=None, max_length=500)


class CourseOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)


class EnrollmentOut(BaseModel):
    id: int
    course_id: int
    student_id: int

    model_config = {"from_attributes": True}


class StudentInfo(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    department: str
    course: Optional[str] = None