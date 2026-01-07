from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, default="")
    theme_preference = Column(String, default="default")
    dark_mode = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, unique=True, index=True)
    company_name = Column(String, index=True)
    domain = Column(String, index=True)
    industry = Column(String, index=True)
    profile_data = Column(JSON) # Stores the full CompanyProfile
    embedding = Column(JSON) # Stores the embedding vector
    created_at = Column(DateTime, default=datetime.utcnow)
