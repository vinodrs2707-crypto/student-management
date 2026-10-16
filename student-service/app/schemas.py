from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=15)
    department: str = Field(min_length=2, max_length=100)
    course: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, min_length=7, max_length=15)
    department: Optional[str] = Field(default=None, min_length=2, max_length=100)
    course: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    department: str
    course: Optional[str] = None

    model_config = {"from_attributes": True}