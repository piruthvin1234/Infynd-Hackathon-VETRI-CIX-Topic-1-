import os
import time
import hashlib
from typing import Optional, List
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

class HTMLCacheService:
    """
    Service to manage HTML caching for scraped websites.
    Checks if HTML exists in cache, otherwise scrapes and stores it.
    """
    
    def __init__(self, cache_dir: str = "scraped_html"):
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)
        self._driver = None
    
    def _get_driver(self):
        """Initialize Selenium driver lazily"""
        if self._driver is None:
            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            self._driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=options
            )
        return self._driver
    
    def _normalize_domain(self, url: str) -> str:
        """
        Extract domain from URL for consistent file naming.
        Examples:
            https://example.com -> example.com
            http://www.example.com/page -> example.com
            example.com -> example.com
        """
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        parsed = urlparse(url)
        domain = parsed.netloc
        
        # Remove 'www.' prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]
        
        return domain
    
    def _get_cache_path(self, url: str) -> str:
        """Get the file path for cached HTML based on URL"""
        domain = self._normalize_domain(url)
        return os.path.join(self.cache_dir, f"{domain}.html")
    
    def _scrape_with_selenium(self, url: str, wait_time: int = 5) -> Optional[str]:
        """
        Scrape URL using Selenium (similar to scrape_only.py logic)
        Tries both with and without 'www.' prefix
        """
        if not url.startswith(('http://', 'https://')):
            base_url = url
            urls_to_try = [
                f"https://{base_url}",
                f"https://www.{base_url}"
            ]
        else:
            urls_to_try = [url]
            # Also try with www if not present
            parsed = urlparse(url)
            if not parsed.netloc.startswith('www.'):
                www_url = f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}"
                if parsed.query:
                    www_url += f"?{parsed.query}"
                urls_to_try.append(www_url)
        
        driver = self._get_driver()
        
        for try_url in urls_to_try:
            try:
                print(f"🌐 Scraping {try_url}")
                driver.get(try_url)
                time.sleep(wait_time)
                
                html = driver.page_source
                
                # Validate that we got meaningful content
                if len(html) < 2000:
                    print(f"⚠️ Content too small ({len(html)} bytes), trying next variant...")
                    continue
                
                print(f"✅ Successfully scraped {try_url} ({len(html)} bytes)")
                return html
                
            except Exception as e:
                print(f"⚠️ Error scraping {try_url}: {e}")
                continue
        
        print(f"❌ Failed to scrape all variants of {url}")
        return None
    
    def get_html(self, url: str, force_refresh: bool = False) -> Optional[str]:
        """
        Get HTML content for a URL.
        
        Args:
            url: The URL or domain to fetch
            force_refresh: If True, bypass cache and scrape fresh
        
        Returns:
            HTML content as string, or None if failed
        """
        cache_path = self._get_cache_path(url)
        
        # Check cache first (unless force refresh)
        if not force_refresh and os.path.exists(cache_path):
            print(f"📦 Using cached HTML for {url} from {cache_path}")
            try:
                with open(cache_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            except Exception as e:
                print(f"⚠️ Error reading cache: {e}, will scrape fresh")
        
        # Cache miss or force refresh - scrape it
        print(f"🔍 Cache miss for {url}, scraping...")
        html = self._scrape_with_selenium(url)
        
        if html:
            # Save to cache
            try:
                with open(cache_path, 'w', encoding='utf-8', errors='ignore') as f:
                    f.write(html)
                print(f"💾 Saved to cache: {cache_path}")
            except Exception as e:
                print(f"⚠️ Error saving to cache: {e}")
        
        return html
    
    def get_html_batch(self, urls: List[str], force_refresh: bool = False) -> dict:
        """
        Get HTML for multiple URLs.
        
        Args:
            urls: List of URLs to fetch
            force_refresh: If True, bypass cache for all
        
        Returns:
            Dictionary mapping URL -> HTML content (or None if failed)
        """
        results = {}
        for url in urls:
            results[url] = self.get_html(url, force_refresh)
        return results
    
    def clear_cache(self, url: Optional[str] = None):
        """
        Clear cache for a specific URL or all cached files.
        
        Args:
            url: If provided, clear only this URL's cache. If None, clear all.
        """
        if url:
            cache_path = self._get_cache_path(url)
            if os.path.exists(cache_path):
                os.remove(cache_path)
                print(f"🗑️ Cleared cache for {url}")
        else:
            # Clear all cache
            for file in os.listdir(self.cache_dir):
                file_path = os.path.join(self.cache_dir, file)
                if os.path.isfile(file_path) and file.endswith('.html'):
                    os.remove(file_path)
            print(f"🗑️ Cleared all cache in {self.cache_dir}")
    
    def get_cache_info(self) -> dict:
        """Get information about cached files"""
        cached_files = []
        total_size = 0
        
        for file in os.listdir(self.cache_dir):
            file_path = os.path.join(self.cache_dir, file)
            if os.path.isfile(file_path) and file.endswith('.html'):
                size = os.path.getsize(file_path)
                total_size += size
                cached_files.append({
                    "domain": file.replace('.html', ''),
                    "size_bytes": size,
                    "size_mb": round(size / (1024 * 1024), 2),
                    "modified": os.path.getmtime(file_path)
                })
        
        return {
            "total_files": len(cached_files),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "files": cached_files
        }
    
    def __del__(self):
        """Cleanup driver on deletion"""
        if self._driver:
            try:
                self._driver.quit()
            except:
                pass

# Global instance
html_cache_service = HTMLCacheService()
