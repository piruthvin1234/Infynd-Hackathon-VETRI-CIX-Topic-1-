import requests
import numpy as np
from typing import List, Dict, Any

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
MODEL_NAME = "qwen2.5:7b-instruct-q4_K_M"

class SimilarityService:
    def generate_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for a piece of text using Ollama."""
        payload = {
            "model": MODEL_NAME,
            "prompt": text
        }
        try:
            response = requests.post(OLLAMA_EMBED_URL, json=payload)
            response.raise_for_status()
            return response.json().get("embedding", [])
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    async def add_company(self, db, company_id: str, company_name: str, description: str):
        """Generate and store embedding for a company in MongoDB."""
        vector = self.generate_embedding(description)
        if vector:
            await db.companies.update_one(
                {"company_id": company_id},
                {"$set": {"embedding": vector}}
            )

    async def find_similar(self, db, company_id: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Find top_k similar companies based on cosine similarity."""
        target_company = await db.companies.find_one({"company_id": company_id})
        if not target_company or "embedding" not in target_company:
            return []
        
        target_vector = np.array(target_company["embedding"])
        
        cursor = db.companies.find({
            "company_id": {"$ne": company_id},
            "embedding": {"$exists": True}
        })
        
        results = []
        async for c in cursor:
            vector = np.array(c["embedding"])
            norm_a = np.linalg.norm(target_vector)
            norm_b = np.linalg.norm(vector)
            
            if norm_a == 0 or norm_b == 0:
                similarity = 0
            else:
                similarity = np.dot(target_vector, vector) / (norm_a * norm_b)
                
            results.append({
                "company_id": c["company_id"],
                "company_name": c["company_name"]["value"],
                "score": float(similarity)
            })
            
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

similarity_service = SimilarityService()
