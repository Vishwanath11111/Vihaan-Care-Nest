from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Vihaan Care Nest API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "vihaan_care_nest_secret_key_2024"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Enums
class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    TEAM_MEMBER = "team_member"

class SubscriptionType(str, Enum):
    BABY_BASIC = "baby_basic"
    BABY_STANDARD = "baby_standard"
    BABY_PREMIUM = "baby_premium"
    MOTHER_BASIC = "mother_basic"
    MOTHER_STANDARD = "mother_standard"
    MOTHER_PREMIUM = "mother_premium"

class ServiceStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    role: UserRole = UserRole.CUSTOMER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Location(BaseModel):
    locality: str
    area: str
    city: str
    district: str
    pincode: str

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location: Optional[Location] = None
    subscription_type: Optional[SubscriptionType] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    is_subscribed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    specialties: List[str] = []
    rating: float = 0.0
    total_reviews: int = 0
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    team_member_id: Optional[str] = None
    subscription_type: SubscriptionType
    scheduled_date: datetime
    duration_hours: int = 2
    status: ServiceStatus = ServiceStatus.SCHEDULED
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    customer_id: str
    subscription_type: SubscriptionType
    scheduled_date: datetime
    notes: Optional[str] = None

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    team_member_id: str
    appointment_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionPackage(BaseModel):
    id: str
    name: str
    type: SubscriptionType
    visits_per_week: int
    price_per_month: int
    description: str
    target: str  # "baby" or "mother"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole

class AdminDashboard(BaseModel):
    total_subscribers: int
    monthly_subscribers: int
    yearly_subscribers: int
    todays_appointments: int
    pending_assignments: int

# Subscription packages data
SUBSCRIPTION_PACKAGES = [
    SubscriptionPackage(
        id="baby_basic",
        name="Basic Baby Care",
        type=SubscriptionType.BABY_BASIC,
        visits_per_week=2,
        price_per_month=6000,
        description="Essential care with 2 visits per week",
        target="baby"
    ),
    SubscriptionPackage(
        id="baby_standard",
        name="Standard Baby Care",
        type=SubscriptionType.BABY_STANDARD,
        visits_per_week=4,
        price_per_month=10000,
        description="Enhanced care with 4 visits per week",
        target="baby"
    ),
    SubscriptionPackage(
        id="baby_premium",
        name="Premium Baby Care",
        type=SubscriptionType.BABY_PREMIUM,
        visits_per_week=7,
        price_per_month=14000,
        description="Complete care with daily visits",
        target="baby"
    ),
    SubscriptionPackage(
        id="mother_basic",
        name="Basic Mother Care",
        type=SubscriptionType.MOTHER_BASIC,
        visits_per_week=2,
        price_per_month=5000,
        description="Essential postpartum care with 2 visits per week",
        target="mother"
    ),
    SubscriptionPackage(
        id="mother_standard",
        name="Standard Mother Care",
        type=SubscriptionType.MOTHER_STANDARD,
        visits_per_week=4,
        price_per_month=9000,
        description="Enhanced postpartum care with 4 visits per week",
        target="mother"
    ),
    SubscriptionPackage(
        id="mother_premium",
        name="Premium Mother Care",
        type=SubscriptionType.MOTHER_PREMIUM,
        visits_per_week=7,
        price_per_month=12000,
        description="Complete postpartum care with daily visits",
        target="mother"
    )
]

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Routes
@api_router.get("/")
async def root():
    return {"message": "Vihaan Care Nest API"}

@api_router.get("/packages", response_model=List[SubscriptionPackage])
async def get_packages():
    return SUBSCRIPTION_PACKAGES

@api_router.post("/auth/register", response_model=User)
async def register(user_create: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_create.password)
    user_dict = user_create.dict()
    user_dict.pop("password")
    user_obj = User(**user_dict)
    
    # Store user with hashed password
    user_store = user_obj.dict()
    user_store["hashed_password"] = hashed_password
    
    await db.users.insert_one(user_store)
    
    # Create customer profile if role is customer
    if user_create.role == UserRole.CUSTOMER:
        customer = Customer(user_id=user_obj.id)
        await db.customers.insert_one(customer.dict())
    elif user_create.role == UserRole.TEAM_MEMBER:
        team_member = TeamMember(user_id=user_obj.id)
        await db.team_members.insert_one(team_member.dict())
    
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"email": user_login.email})
    if not user or not verify_password(user_login.password, user.get("hashed_password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return Token(
        access_token=access_token, 
        token_type="bearer", 
        role=UserRole(user["role"])
    )

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/customers/update-location")
async def update_customer_location(
    location: Location,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can update location"
        )
    
    await db.customers.update_one(
        {"user_id": current_user.id},
        {"$set": {"location": location.dict()}}
    )
    return {"message": "Location updated successfully"}

@api_router.post("/customers/subscribe")
async def subscribe_customer(
    subscription_data: dict,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can subscribe"
        )
    
    subscription_type = SubscriptionType(subscription_data["subscription_type"])
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=30)
    
    await db.customers.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "subscription_type": subscription_type.value,
            "subscription_start_date": start_date,
            "subscription_end_date": end_date,
            "is_subscribed": True
        }}
    )
    return {"message": "Subscription activated successfully"}

@api_router.get("/admin/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(current_user: User = Depends(get_current_admin)):
    # Get total subscribers
    total_subscribers = await db.customers.count_documents({"is_subscribed": True})
    
    # Get monthly subscribers (this month)
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_subscribers = await db.customers.count_documents({
        "is_subscribed": True,
        "subscription_start_date": {"$gte": start_of_month}
    })
    
    # Get yearly subscribers (this year)
    start_of_year = datetime.now(timezone.utc).replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    yearly_subscribers = await db.customers.count_documents({
        "is_subscribed": True,
        "subscription_start_date": {"$gte": start_of_year}
    })
    
    # Get today's appointments
    start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    todays_appointments = await db.appointments.count_documents({
        "scheduled_date": {"$gte": start_of_day, "$lt": end_of_day}
    })
    
    # Get pending assignments
    pending_assignments = await db.appointments.count_documents({
        "team_member_id": None,
        "status": ServiceStatus.SCHEDULED.value
    })
    
    return AdminDashboard(
        total_subscribers=total_subscribers,
        monthly_subscribers=monthly_subscribers,
        yearly_subscribers=yearly_subscribers,
        todays_appointments=todays_appointments,
        pending_assignments=pending_assignments
    )

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.CUSTOMER:
        customer = await db.customers.find_one({"user_id": current_user.id})
        appointments = await db.appointments.find({"customer_id": customer["id"]}).to_list(1000)
    elif current_user.role == UserRole.ADMIN:
        appointments = await db.appointments.find().to_list(1000)
    else:
        appointments = await db.appointments.find({"team_member_id": current_user.id}).to_list(1000)
    
    return [Appointment(**appointment) for appointment in appointments]

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(
    appointment_create: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    appointment = Appointment(**appointment_create.dict())
    await db.appointments.insert_one(appointment.dict())
    return appointment

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()