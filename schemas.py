from pydantic import BaseModel
from typing import Optional

# This is the data we expect when the user is ADDING a new product
class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    stock_quantity: int = 0

# This is the data we SEND BACK when the user asks for a product
class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# This is for Step 1 of your manual flow
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    
    class Config:
        from_attributes = True

# We need a new schema for Step 3 when they finally submit their phone
class UserAddPhone(BaseModel):
    user_id: int
    phone_number: str

class CartItemCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

# --- THE MISSING CLASS ---
class CartItemUpdate(BaseModel):
    quantity: int


class OTPVerify(BaseModel):
    email: str
    otp_code: str

class OTPResend(BaseModel):
    email: str

class GoogleToken(BaseModel):
    credential: str