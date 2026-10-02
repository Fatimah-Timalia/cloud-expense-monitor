from schemas import ExpenseCreate, UserCreate
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database import engine, Base, SessionLocal
import models
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)



app = FastAPI(title="Cloud Expense Monitor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://6abf48303a59e41f50a3cbf4--cloud-expense-monitor.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


# Database connection
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Cloud Expense Monitor API is running 🚀"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/expenses")
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    new_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        user_id=user_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {
        "message": "Expense added successfully",
        "expense_id": new_expense.id
    }
@app.get("/expenses")
def get_expenses(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).all()

    return expenses


@app.post("/expenses")
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    new_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        user_id=user_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {
        "message": "Expense added successfully",
        "expense_id": new_expense.id
    }


@app.get("/expenses/summary")
def expense_summary(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).all()

    total_amount = sum(
        expense.amount for expense in expenses
    )

    category_summary = {}

    for expense in expenses:
        if expense.category not in category_summary:
            category_summary[expense.category] = 0

        category_summary[expense.category] += expense.amount

    return {
        "total_expenses": len(expenses),
        "total_amount": total_amount,
        "category_summary": category_summary
    }


@app.get("/expenses/{expense_id}")
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    existing_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()

    if not existing_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    existing_expense.title = expense.title
    existing_expense.amount = expense.amount
    existing_expense.category = expense.category
    existing_expense.date = expense.date

    db.commit()
    db.refresh(existing_expense)

    return {
        "message": "Expense updated successfully",
        "expense": existing_expense
    }


@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }
@app.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_password = hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

@app.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "user_id": existing_user.id,
        "email": existing_user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


