import os
import asyncio
from typing import List, Dict
from models import BatchStatus, CompanyProfile
from extractor import load_and_clean_html, process_html_content
from llm_service import extract_company_data
from graph_builder import build_knowledge_graph
from similarity_service import similarity_service
from scraper import scrape_url, deep_scrape_url
from database import client, DATABASE_NAME

class BatchProcessor:
    def __init__(self):
        self.status = BatchStatus(total=0, processed=0, failed=0)
        self.is_processing = False
        self.queue = []

    async def start_batch(self, root_directory: str):
        if self.is_processing:
            return {"message": "Batch already running"}
        
        if not os.path.exists(root_directory):
            return {"error": "Directory not found"}

        subdirs = [os.path.join(root_directory, d) for d in os.listdir(root_directory) if os.path.isdir(os.path.join(root_directory, d))]
        
        if not subdirs:
            subdirs = [root_directory]

        self.queue = subdirs
        self.status = BatchStatus(total=len(subdirs), processed=0, failed=0)
        self.is_processing = True
        
        asyncio.create_task(self._process_queue())
        return {"message": "Batch started", "total": len(subdirs)}

    async def start_url_batch(self, urls: List[str]):
        if self.is_processing:
            return {"message": "Batch already running"}
            
        self.queue = urls
        self.status = BatchStatus(total=len(urls), processed=0, failed=0)
        self.is_processing = True
        
        asyncio.create_task(self._process_queue())
        return {"message": "Batch started", "total": len(urls)}

    async def _process_queue(self):
        semaphore = asyncio.Semaphore(5)
        
        tasks = []
        for item in self.queue:
            tasks.append(self._process_item(item, semaphore))
        
        await asyncio.gather(*tasks)
        
        self.is_processing = False
        self.status.current_company = None

    async def _process_item(self, item, semaphore):
        async with semaphore:
            is_url = item.startswith("http") or item.startswith("www") or "." in item and "/" not in item and "\\" not in item
            
            company_name = item
            if is_url:
                if not item.startswith("http"):
                    item = "https://" + item
                company_name = item
            else:
                company_name = os.path.basename(item)
                
            self.status.current_company = company_name
            
            try:
                # 1. Extract
                if is_url:
                    print(f"Batch Processing URL: {item}")
                    html_content = deep_scrape_url(item)
                    if not html_content:
                        raise Exception("Failed to fetch URL")
                    text, tech_signals = process_html_content(html_content, item)
                else:
                    text, tech_signals = load_and_clean_html(item)
                
                if not text:
                    raise Exception("No content found")

                # 2. LLM
                data = extract_company_data(text, tech_signals, item)
                if not data:
                    raise Exception("LLM extraction failed")
                
                # 3. Create Profile
                profile = CompanyProfile(**data)
                
                # Enrichment check for Batch
                missing_critical = []
                if not profile.contact_phone.value: missing_critical.append("phone number")
                if not profile.contact_email.value: missing_critical.append("email")
                if not profile.headquarters.value: missing_critical.append("headquarters")
                
                if missing_critical:
                    # Use a simpler company name check for batch to avoid huge logs
                    c_name = profile.company_name.value or company_name
                    print(f"BATCH ENRICHMENT: Missing {missing_critical} for {c_name}")
                    
                    try:
                        from search_service import search_service
                        dom = profile.domain.value or (item if is_url else "")
                        search_snippets = search_service.search_company_info(c_name, dom)
                        
                        if search_snippets:
                            enriched_text = text + "\n\n--- SEARCH INTELLIGENCE RESULTS ---\n" + search_snippets
                            enriched_data = extract_company_data(enriched_text, tech_signals, item)
                            if enriched_data:
                                profile = CompanyProfile(**enriched_data)
                    except Exception as e:
                        print(f"Enrichment failed for {c_name}: {e}")

                if not profile.company_name.value:
                    profile.company_name.value = company_name
                
                # Database access
                db = client[DATABASE_NAME]

                # 4. Add to Similarity Index
                desc = profile.long_description.value or profile.short_description.value
                await similarity_service.add_company(db, profile.company_id, profile.company_name.value, desc)
                
                # 5. Save to Storage
                from storage_service import storage_service
                await storage_service.save_company(db, profile)
                
                # 6. Store Result
                flattened_result = {
                    "company_name": profile.company_name.value,
                    "domain": profile.domain.value,
                    "logo_url": profile.logo_url.value,
                    "industry": profile.industry.value,
                    "sub_industry": profile.sub_industry.value,
                    "short_description": profile.short_description.value,
                    "long_description": profile.long_description.value,
                    "headquarters": profile.headquarters.value,
                    "full_address": profile.full_address.value or profile.headquarters.value,
                    "contact_email": profile.contact_email.value,
                    "contact_phone": profile.contact_phone.value,
                    "sales_phone": profile.sales_phone.value,
                    "fax": profile.fax.value,
                    "mobile": profile.mobile.value,
                    "other_numbers": profile.other_numbers.value,
                    "contact_page": profile.contact_page.value,
                    "founded_year": profile.founded_year.value,
                    "hours_of_operation": profile.hours_of_operation.value,
                    "hq_indicator": profile.hq_indicator.value
                }
                self.status.results.append(flattened_result)
                self.status.processed += 1
                
            except Exception as e:
                print(f"Failed to process {company_name}: {e}")
                self.status.failed += 1
                self.status.results.append({"company_name": company_name, "error": str(e)})

    def get_status(self) -> BatchStatus:
        return self.status

batch_processor = BatchProcessor()
