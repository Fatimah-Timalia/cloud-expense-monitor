from pydantic import BaseModel
from datetime import date


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: date
class UserLogin(BaseModel):
    email: str
    password: str
