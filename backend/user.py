from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from auth import get_current_user, get_password_hash, verify_password
import shutil
import os
from datetime import datetime
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/user", tags=["user"])

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UserUpdate(BaseModel):
    name: str
    email: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PreferencesUpdate(BaseModel):
    theme_preference: str = "default"
    dark_mode: bool = False

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    if update_data.email != current_user["email"]:
        existing_user = await db.users.find_one({"email": update_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
    
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"name": update_data.name, "email": update_data.email}}
    )
    
    return {"message": "Profile updated successfully", "user": {
        "email": update_data.email,
        "name": update_data.name,
        "avatar_url": current_user["avatar_url"],
        "theme_preference": current_user["theme_preference"],
        "dark_mode": current_user["dark_mode"]
    }}

@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    # Fetch user from DB to get fresh password hash
    user = await db.users.find_one({"email": current_user["email"]})
    
    if not verify_password(password_data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    hashed_password = get_password_hash(password_data.new_password)
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Password changed successfully"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user['id']}_{timestamp}{os.path.splitext(file.filename)[1]}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    avatar_url = f"/{UPLOAD_DIR}/{filename}"
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    
    return {"message": "Avatar uploaded successfully", "avatar_url": avatar_url}

@router.put("/preferences")
async def update_preferences(
    preferences: PreferencesUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {
            "theme_preference": preferences.theme_preference,
            "dark_mode": preferences.dark_mode
        }}
    )
    
    return {"message": "Preferences updated successfully", "preferences": preferences}

@router.delete("/account")
async def delete_account(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"is_active": False}}
    )
    return {"message": "Account deactivated"}
