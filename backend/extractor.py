import os
from bs4 import BeautifulSoup
from typing import List, Dict, Tuple

MAX_CHUNK_SIZE = 15000  # Characters, approx 4k tokens

def process_html_content(html_content: str, source_name: str = "Uploaded File") -> Tuple[str, List[str]]:
    """
    Processes raw HTML content string.
    """
    aggregated_text = ""
    tech_signals = set()
    
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Extract Tech Signals FIRST (before removing anything)
        extract_tech_signals(soup, tech_signals)
        
        # Extract metadata that might have useful info
        meta_info = []
        
        # Get meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            meta_info.append(f"META DESCRIPTION: {meta_desc['content']}")
        
        # Get title
        title = soup.find("title")
        if title:
            meta_info.append(f"PAGE TITLE: {title.get_text()}")
        
        # CRITICAL: Extract logo URLs explicitly
        logo_candidates = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            alt = img.get("alt", "").lower()
            img_class = " ".join(img.get("class", [])).lower()
            
            # Check if this looks like a logo
            if any(keyword in src.lower() for keyword in ["logo", "brand"]) or \
               any(keyword in alt for keyword in ["logo", "brand"]) or \
               any(keyword in img_class for keyword in ["logo", "brand", "header-logo"]):
                logo_candidates.append(src)
        
        if logo_candidates:
            meta_info.append(f"LOGO_URLS_FOUND: {', '.join(logo_candidates[:3])}")  # Top 3
        
        # CRITICAL: Extract email addresses explicitly
        email_candidates = []
        import re
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        # Check mailto links
        for link in soup.find_all("a", href=True):
            if link["href"].startswith("mailto:"):
                email = link["href"].replace("mailto:", "").split("?")[0]
                email_candidates.append(email)
        
        # Check text content for emails
        text_emails = re.findall(email_pattern, html_content)
        email_candidates.extend(text_emails[:5])  # Limit to avoid spam
        
        if email_candidates:
            unique_emails = list(set(email_candidates))[:3]  # Top 3 unique
            meta_info.append(f"EMAILS_FOUND: {', '.join(unique_emails)}")

        # CRITICAL: Extract phone numbers explicitly
        phone_candidates = []
        # Support various formats like +1 123-456-7890, (123) 456-7890, 123.456.7890, etc.
        phone_pattern = r'\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        
        # Check tel links
        for link in soup.find_all("a", href=True):
            if link["href"].startswith("tel:"):
                phone = link["href"].replace("tel:", "").split("?")[0]
                phone_candidates.append(phone)
        
        # Check text content for phones (only if they look long enough to be real)
        text_phones = re.findall(phone_pattern, html_content)
        for tp in text_phones:
            if len(re.sub(r'\D', '', tp)) >= 10: # Min 10 digits
                phone_candidates.append(tp.strip())
        
        if phone_candidates:
            unique_phones = list(set(phone_candidates))[:3]
            meta_info.append(f"PHONES_FOUND: {', '.join(unique_phones)}")
        
        # Remove only truly useless elements (keep nav and footer - they have contact info!)
        for tag in soup(["script", "style", "iframe", "noscript"]):
            tag.extract()
        
        # Get main text
        text = soup.get_text(separator=" ")
        
        # Cleanup whitespace but preserve structure
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk and len(chunk) > 2)
        
        # Combine metadata + content
        if meta_info:
            aggregated_text = "\n".join(meta_info) + "\n\n" + clean_text
        else:
            aggregated_text = clean_text
            
    except Exception as e:
        print(f"Error processing content: {e}")
        
    return aggregated_text, list(tech_signals)

def load_and_clean_html(path: str) -> Tuple[str, List[str]]:
    """
    Iterates through HTML files (or a single file), cleans them, and returns aggregated text and list of tech signals.
    """
    aggregated_text = ""
    tech_signals = set()
    
    if not os.path.exists(path):
        return "", []

    def process_file(file_path):
        nonlocal aggregated_text
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                text, signals = process_html_content(content, os.path.basename(file_path))
                aggregated_text += text
                tech_signals.update(signals)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    if os.path.isfile(path):
        process_file(path)
    else:
        for root, _, files in os.walk(path):
            for file in files:
                if file.lower().endswith(".html") or file.lower().endswith(".htm"):
                    file_path = os.path.join(root, file)
                    process_file(file_path)
                    
    return aggregated_text, list(tech_signals)

def extract_tech_signals(soup: BeautifulSoup, signals: set):
    """
    Heuristic extraction of tech stack from meta tags and script src.
    """
    # Check meta generator
    meta_gen = soup.find("meta", attrs={"name": "generator"})
    if meta_gen and meta_gen.get("content"):
        signals.add(meta_gen["content"])
        
    # Check script src
    for script in soup.find_all("script", src=True):
        src = script["src"].lower()
        if "react" in src: signals.add("React")
        if "vue" in src: signals.add("Vue.js")
        if "angular" in src: signals.add("Angular")
        if "jquery" in src: signals.add("jQuery")
        if "bootstrap" in src: signals.add("Bootstrap")
        if "shopify" in src: signals.add("Shopify")
        if "wordpress" in src: signals.add("WordPress")
        if "google-analytics" in src or "gtag" in src: signals.add("Google Analytics")
        if "stripe" in src: signals.add("Stripe")

def chunk_text(text: str, max_size: int = MAX_CHUNK_SIZE) -> List[str]:
    """
    Splits text into chunks to fit LLM context window.
    """
    return [text[i:i+max_size] for i in range(0, len(text), max_size)]
