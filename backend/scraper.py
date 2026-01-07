import requests
from typing import Optional, List
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from html_cache_service import html_cache_service

def scrape_url(url: str, use_cache: bool = True) -> tuple[Optional[str], str]:
    """
    Fetches the HTML content of a given URL.
    First checks cache, then falls back to live scraping if needed.
    Returns (html_content, final_effective_url).
    
    Args:
        url: URL to scrape
        use_cache: If True, check cache first. If False, always scrape fresh.
    """
    # Try cache first if enabled
    if use_cache:
        cached_html = html_cache_service.get_html(url, force_refresh=False)
        if cached_html:
            return cached_html, url
    
    # Cache miss or disabled - try requests first (faster)
    if not url.startswith("http"):
        url = "https://" + url
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=20, allow_redirects=True)
        response.raise_for_status()
        return response.text, response.url
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        # Fallback to Selenium via cache service
        print(f"Falling back to Selenium scraper...")
        selenium_html = html_cache_service.get_html(url, force_refresh=True)
        if selenium_html:
            return selenium_html, url
        return None, url

def scout_internal_links(html: str, base_url: str) -> List[str]:
    """
    Finds links to high-value pages like Contact, About, etc.
    """
    if not html: return []
    soup = BeautifulSoup(html, "html.parser")
    links = []
    
    # Ensure base_url is valid for urljoin/urlparse
    if not base_url.startswith('http'):
         base_url = 'https://' + base_url

    domain = urlparse(base_url).netloc
    
    target_keywords = ["contact", "about", "team", "privacy", "legal", "imprint", "terms"]
    
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full_url = urljoin(base_url, href)
        parsed_full = urlparse(full_url)
        
        # Only stay on same domain
        if parsed_full.netloc == domain:
            text = a.get_text().lower()
            path = parsed_full.path.lower()
            
            if any(k in text or k in path for k in target_keywords):
                if full_url not in links and full_url != base_url:
                    links.append(full_url)
                    
    return links[:5] # Limit to top 5 discovered links

def deep_scrape_url(url: str) -> str:
    """
    Scrapes the main URL and discovered high-value internal pages.
    Aggregates content to find more data points.
    """
    main_html, final_url = scrape_url(url)
    if not main_html:
        return ""
    
    content_parts = [main_html]
    
    # Use final_url as base to ensure relative links resolve correctly
    discovered_links = scout_internal_links(main_html, final_url)
    
    print(f"Deep Scrape: Found {len(discovered_links)} additional pages to scout...")
    
    for link in discovered_links:
        print(f"Scouting {link}...")
        sub_html, _ = scrape_url(link)
        if sub_html:
            # We only need the text part or a stripped down version to save tokens/memory
            content_parts.append(f"\n--- CONTENT FROM {link} ---\n")
            content_parts.append(sub_html)
            
    return "\n".join(content_parts)
