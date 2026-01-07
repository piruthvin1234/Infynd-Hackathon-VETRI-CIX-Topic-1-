from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List, Optional
import pandas as pd
import io

from extractor import load_and_clean_html, process_html_content
from llm_service import extract_company_data
from graph_builder import build_knowledge_graph
from models import ProcessingResponse, CompanyProfile, KnowledgeGraph, BatchStatus
from batch_processor import batch_processor
from similarity_service import similarity_service
from storage_service import storage_service
from scraper import scrape_url, deep_scrape_url
from html_cache_service import html_cache_service

# New Auth and User routers
from auth import router as auth_router, get_current_user
from user import router as user_router
from database import get_db

app = FastAPI(title="VETRI CIX Enhanced", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

# Include new routers
app.include_router(auth_router)
app.include_router(user_router)

class ProcessRequest(BaseModel):
    directory_path: str

@app.post("/process", response_model=ProcessingResponse)
async def process_single_website(
    directory_path: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db = Depends(get_db)
):
    """
    Process a single company directory, uploaded file, or URL.
    """
    if directory_path and not os.path.exists(directory_path):
        if "." in directory_path or directory_path.startswith(("http://", "https://")):
            url = directory_path
            directory_path = None
    
    text = ""
    tech_signals = []
    source_name = ""

    if file:
        content = await file.read()
        text, tech_signals = process_html_content(content.decode("utf-8", errors="ignore"), file.filename)
        source_name = file.filename
    elif directory_path:
        text, tech_signals = load_and_clean_html(directory_path)
        source_name = os.path.basename(directory_path)
    elif url:
        html_content = deep_scrape_url(url)
        if not html_content:
            raise HTTPException(status_code=400, detail="Failed to fetch URL")
        text, tech_signals = process_html_content(html_content, url)
        source_name = url
    else:
        raise HTTPException(status_code=400, detail="Either directory_path, url or file must be provided")

    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from source")

    # First extraction
    data = extract_company_data(text, tech_signals, source_name)
    if not data:
        raise HTTPException(status_code=500, detail="Extraction failed")
        
    profile = CompanyProfile(**data)
    
    # Enrichment check: if key fields are missing, use search intelligence
    missing_critical = []
    if not profile.contact_phone.value: missing_critical.append("phone number")
    if not profile.contact_email.value: missing_critical.append("email")
    if not profile.headquarters.value: missing_critical.append("headquarters")
    if not profile.key_people.value: missing_critical.append("CEO/Founder")
    
    if missing_critical and profile.company_name.value:
        print(f"ENRICHMENT: Missing {missing_critical} for {profile.company_name.value}. Launching web scouts...")
        from search_service import search_service
        search_snippets = search_service.search_company_info(profile.company_name.value, profile.domain.value)
        
        if search_snippets:
            # Re-extract with augmented text
            enriched_text = text + "\n\n--- SEARCH INTELLIGENCE RESULTS ---\n" + search_snippets
            enriched_data = extract_company_data(enriched_text, tech_signals, source_name)
            if enriched_data:
                profile = CompanyProfile(**enriched_data)

    if not profile.company_name.value:
        profile.company_name.value = source_name

    graph = build_knowledge_graph(profile)
    
    # Save to storage
    await storage_service.save_company(db, profile)
    
    # Add to similarity index
    desc = profile.long_description.value or profile.short_description.value
    await similarity_service.add_company(db, profile.company_id, profile.company_name.value, desc)
    
    return ProcessingResponse(profile=profile, graph=graph)

@app.post("/process/bulk")
async def process_bulk_file(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file format")
            
        url_col = None
        for col in df.columns:
            if any(k in col.lower() for k in ['domain', 'url', 'website']):
                url_col = col
                break
        
        if not url_col:
             url_col = df.columns[0]
             
        urls = df[url_col].dropna().astype(str).tolist()
        return await batch_processor.start_url_batch(urls)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/batch/status", response_model=BatchStatus)
async def get_batch_status():
    return batch_processor.get_status()

@app.post("/batch/start")
async def start_batch(request: ProcessRequest):
    return await batch_processor.start_batch(request.directory_path)

@app.get("/batch/export")
async def export_batch_results():
    status = batch_processor.get_status()
    if not status.results:
        raise HTTPException(status_code=400, detail="No batch results to export")
    
    df = pd.DataFrame(status.results)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    
    stream.seek(0)
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=batch_results.xlsx"}
    )

@app.get("/companies")
async def list_companies(db = Depends(get_db)):
    return await storage_service.list_companies(db)

@app.get("/stats")
async def get_stats(db = Depends(get_db)):
    return await storage_service.get_stats(db)

@app.get("/company/{company_id}", response_model=ProcessingResponse)
async def get_company(company_id: str, db = Depends(get_db)):
    profile = await storage_service.get_company(db, company_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Company not found")
    
    graph = build_knowledge_graph(profile)
    return ProcessingResponse(profile=profile, graph=graph)

@app.get("/company/{company_id}/similar")
async def get_similar_companies(company_id: str, db = Depends(get_db)):
    return await similarity_service.find_similar(db, company_id)

@app.get("/export")
async def export_data(format: str = "csv", db = Depends(get_db)):
    profiles = await storage_service.get_all_profiles(db)
    
    export_data = []
    for p in profiles:
        row = {
            "company_name": p.company_name.value,
            "domain": p.domain.value,
            "logo_url": p.logo_url.value,
            "industry": p.industry.value,
            "sub_industry": p.sub_industry.value,
            "short_description": p.short_description.value,
            "long_description": p.long_description.value,
            "headquarters": p.headquarters.value,
            "full_address": p.full_address.value or p.headquarters.value,
            "contact_email": p.contact_email.value,
            "contact_phone": p.contact_phone.value,
            "sales_phone": p.sales_phone.value,
            "fax": p.fax.value,
            "mobile": p.mobile.value,
            "other_numbers": p.other_numbers.value,
            "contact_page": p.contact_page.value,
            "founded_year": p.founded_year.value,
            "hours_of_operation": p.hours_of_operation.value,
            "hq_indicator": p.hq_indicator.value
        }
        export_data.append(row)
    
    df = pd.DataFrame(export_data)
    stream = io.BytesIO()
    if format.lower() == "xlsx":
        with pd.ExcelWriter(stream, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = "export.xlsx"
    else:
        df.to_csv(stream, index=False)
        media_type = "text/csv"
        filename = "export.csv"
        
    stream.seek(0)
    from fastapi.responses import StreamingResponse
    return StreamingResponse(stream, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/company/{company_id}/export")
async def export_single_company(company_id: str, format: str = "xlsx", db = Depends(get_db)):
    profile = await storage_service.get_company(db, company_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Map to specific requested columns
    # If office_locations has items, we might want to explode them, but keeping it simple for single row if that matches user intent better,
    # OR create multiple rows if they look like the user example.
    # The user example showed "Head Office", "EIT Head Office" under "text". 
    # Let's try to infer if we have that data. If not, just one row with empty "text".
    
    rows = []
    
    base_row = {
        "domain": profile.domain.value,
        "text": "Headquarters", # Default label
        "company_name": profile.company_name.value,
        "full_address": profile.full_address.value or profile.headquarters.value,
        "phone": profile.contact_phone.value,
        "sales phone": profile.sales_phone.value,
        "fax": profile.fax.value,
        "mobile": profile.mobile.value,
        "other numbers": profile.other_numbers.value,
        "email": profile.contact_email.value,
        "hours_of_operation": profile.hours_of_operation.value,
        "HQ Indicator": profile.hq_indicator.value or "Yes"
    }
    
    rows.append(base_row)
    
    # If we have distinct office locations in the list, add them as rows (simplistic approach)
    if profile.office_locations.value:
        for loc in profile.office_locations.value:
            if loc != base_row["full_address"]: # Avoid dupe
                new_row = base_row.copy()
                new_row["text"] = "Branch/Location"
                new_row["full_address"] = loc
                new_row["HQ Indicator"] = "No"
                rows.append(new_row)

    df = pd.DataFrame(rows)
    
    # Reorder columns to match request image exactly
    cols = ["domain", "text", "company_name", "full_address", "phone", "sales phone", "fax", "mobile", "other numbers", "email", "hours_of_operation", "HQ Indicator"]
    # Ensure all exist
    for c in cols:
        if c not in df.columns:
            df[c] = ""
    df = df[cols]

    stream = io.BytesIO()
    if format.lower() == "xlsx":
        with pd.ExcelWriter(stream, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"{profile.company_name.value or 'company'}_export.xlsx"
    else:
        df.to_csv(stream, index=False)
        media_type = "text/csv"
        filename = f"{profile.company_name.value or 'company'}_export.csv"
        
    stream.seek(0)
    from fastapi.responses import StreamingResponse
    return StreamingResponse(stream, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})

# =====================================================
# CACHE MANAGEMENT ENDPOINTS
# =====================================================

@app.get("/cache/info")
async def get_cache_info():
    """Get information about cached HTML files"""
    return html_cache_service.get_cache_info()

@app.delete("/cache/clear")
async def clear_cache(url: Optional[str] = None):
    """
    Clear cache for a specific URL or all cached files.
    
    Args:
        url: Optional URL to clear. If not provided, clears all cache.
    """
    html_cache_service.clear_cache(url)
    return {
        "message": f"Cache cleared for {url}" if url else "All cache cleared",
        "url": url
    }

@app.post("/cache/refresh")
async def refresh_cache(url: str):
    """
    Force refresh cache for a specific URL by scraping it again.
    
    Args:
        url: URL to refresh
    """
    html = html_cache_service.get_html(url, force_refresh=True)
    if html:
        return {
            "message": f"Cache refreshed for {url}",
            "url": url,
            "size_bytes": len(html)
        }
    else:
        raise HTTPException(status_code=500, detail=f"Failed to scrape {url}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
