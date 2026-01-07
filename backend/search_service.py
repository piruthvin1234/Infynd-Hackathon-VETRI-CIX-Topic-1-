from duckduckgo_search import DDGS
from typing import List, Dict, Any
import time

class SearchService:
    def __init__(self):
        self.ddgs = DDGS()

    def search_company_info(self, company_name: str, domain: str) -> str:
        """
        Searches the web for missing company information.
        Returns a string of aggregated search results snippets.
        """
        queries = [
            f"{company_name} {domain} CEO founder",
            f"{company_name} {domain} headquarters address phone number",
            f"{company_name} {domain} contact email support",
            f"{company_name} {domain} linkedin company profile",
            f"{company_name} official website about us"
        ]
        
        aggregated_results = []
        
        for query in queries:
            try:
                print(f"Searching: {query}...")
                results = self.ddgs.text(query, max_results=3)
                for r in results:
                    aggregated_results.append(f"Source: {r['href']}\nTitle: {r['title']}\nSnippet: {r['body']}\n")
                time.sleep(1) # Rate limiting
            except Exception as e:
                print(f"Search error for '{query}': {e}")
                
        return "\n".join(aggregated_results)

search_service = SearchService()
