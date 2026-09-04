import os
import random
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# This line tells SQLAlchemy to create the tables in Postgres if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow your frontend to talk to your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, # Changed to False to prevent PATCH/DELETE browser errors
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- EMAIL OTP HELPER ---------------- #

def send_email_otp(to_email: str, otp_code: str):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    msg = MIMEText(f"Your verification code is: {otp_code}. It will expire in 10 minutes.")
    msg['Subject'] = 'Verify your E-Commerce Account'
    msg['From'] = sender_email
    msg['To'] = to_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")

# ---------------- AUTH ROUTES ---------------- #

@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    # 1. Generate the OTP and expiration right away
    otp = str(random.randint(100000, 999999))
    expire_time = datetime.utcnow() + timedelta(minutes=10)

    # 2. Check for existing users
    if existing_user:
        if existing_user.email_verified:
            # Fully verified user -> Block them
            raise HTTPException(status_code=400, detail="Email already registered. Please log in.")
        else:
            # UNVERIFIED PURGATORY FIX: Update their credentials and send a new OTP
            existing_user.username = user.username
            existing_user.password_hash = user.password
            existing_user.email_otp = otp
            existing_user.email_otp_expires = expire_time
            db.commit()
            db.refresh(existing_user)
            send_email_otp(user.email, otp)
            return {"message": "Account updated! Please check your email for the new OTP."}

    # 3. Fresh user signup
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password,
        email_otp=otp,
        email_otp_expires=expire_time
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    send_email_otp(user.email, otp)
    return {"message": "Account created! Please check your email for the OTP.", "user_id": new_user.id}
@app.post("/verify-email")
def verify_email_otp(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.email_verified:
        return {"message": "Email is already verified"}
        
    if user.email_otp != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if datetime.utcnow() > user.email_otp_expires:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    # Success! Mark verified and clear the OTP
    user.email_verified = True
    user.email_otp = None
    user.email_otp_expires = None
    db.commit()
    
    # Inside verify_email_otp, replace the final return with:
    return {
        "message": "Email successfully verified!",
        "user_id": user.id,
        "username": user.username
    }

@app.post("/resend-otp")
def resend_email_otp(payload: schemas.OTPResend, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified.")

    # 1. Generate a new OTP and expiration
    otp = str(random.randint(100000, 999999))
    expire_time = datetime.utcnow() + timedelta(minutes=10)

    # 2. Overwrite the old OTP in the database
    user.email_otp = otp
    user.email_otp_expires = expire_time
    db.commit()

    # 3. Physically send the new email
    send_email_otp(user.email, otp)
    
    return {"message": "A fresh OTP has been sent to your email."}

@app.post("/login")
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    if db_user.password_hash != user_credentials.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    # Optional: Prevent login if email isn't verified yet
    if not db_user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")
        
    return {
        "message": "Login successful", 
        "user_id": db_user.id, 
        "username": db_user.username
    }

@app.post("/auth/google")
def google_login(payload: schemas.GoogleToken, db: Session = Depends(get_db)):
    try:
        # 1. Verify the token with Google's servers
        # Replace with your actual Google Client ID later
        CLIENT_ID = "837375612904-t6bbgp46169t7qfvn5ho9kehrc6eldb2.apps.googleusercontent.com" 
        
        id_info = id_token.verify_oauth2_token(
            payload.credential, 
            google_requests.Request(), 
            CLIENT_ID
        )

        # 2. Extract the user data Google guarantees is verified
        email = id_info.get("email")
        name = id_info.get("name", "Google User")

        # 3. Check if user already exists in your database
        user = db.query(models.User).filter(models.User.email == email).first()

        if not user:
            # Create a brand new user. No password needed, and email is pre-verified.
            user = models.User(
                username=name,
                email=email,
                auth_provider="google",
                email_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # 4. Log them in
        return {
            "message": "Google Login successful", 
            "user_id": user.id, 
            "username": user.username
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

# ---------------- PRODUCT ROUTES ---------------- #

@app.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    return {"message": "Successfully connected to PostgreSQL!"}

@app.post("/products/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products/", response_model=list[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_single_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return product

# ---------------- CART ROUTES ---------------- #

@app.post("/cart/", response_model=schemas.CartItemResponse)
def add_item_to_cart(cart_item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == cart_item.user_id,
        models.CartItem.product_id == cart_item.product_id
    ).first()

    if existing_item:
        if existing_item.quantity + cart_item.quantity > product.stock_quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_quantity} in stock!")
            
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        if cart_item.quantity > product.stock_quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_quantity} in stock!")
            
        new_item = models.CartItem(**cart_item.model_dump())
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

@app.patch("/cart/{cart_item_id}")
def update_cart_item(cart_item_id: int, item_update: schemas.CartItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.CartItem).filter(models.CartItem.id == cart_item_id).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if item_update.quantity <= 0:
        db.delete(db_item)
        db.commit()
        return {"message": "Item removed from cart"}
        
    product = db.query(models.Product).filter(models.Product.id == db_item.product_id).first()
    if item_update.quantity > product.stock_quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock_quantity} in stock!")
        
    db_item.quantity = item_update.quantity
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/cart/{cart_item_id}")
def delete_cart_item(cart_item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.CartItem).filter(models.CartItem.id == cart_item_id).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(db_item)
    db.commit()
    return {"message": "Item removed from cart"}

@app.get("/cart/{user_id}", response_model=list[schemas.CartItemResponse])
def get_user_cart(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()
    return cart_items