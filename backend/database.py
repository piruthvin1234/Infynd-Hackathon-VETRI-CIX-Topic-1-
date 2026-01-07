from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DATABASE_NAME = "vetri_cix"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

async def get_db():
    return db

# Helper to convert MongoDB _id to id string
def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj
