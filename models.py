from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    
    # Google users won't have a password
    password_hash = Column(String(255), nullable=True) 
    # Identifies if they signed up via "local" (email/pass) or "google"
    auth_provider = Column(String(20), default="local") 
    
    # Phone is added later in the flow, so it starts as null
    phone_number = Column(String(20), unique=True, nullable=True) 
    
    # OTP Status Trackers
    email_verified = Column(Boolean, default=False)
    mobile_verified = Column(Boolean, default=False)

    # --- NEW COLUMNS FOR OTP ---
    email_otp = Column(String(6), nullable=True) 
    email_otp_expires = Column(DateTime, nullable=True)

    cart_items = relationship("CartItem", back_populates="owner")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(100))
    category = Column(String(100))
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(Text)
    stock_quantity = Column(Integer, default=0)

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)

    # These link the cart item back to the user and the product
    owner = relationship("User", back_populates="cart_items")
    product = relationship("Product")