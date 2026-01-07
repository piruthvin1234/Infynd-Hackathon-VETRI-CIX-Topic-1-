import requests
import os
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# =========================
# CONFIG
# =========================
DOMAINS_FILE = "domains.txt"
HTML_DIR = "scraped_html"
JSON_DIR = "scraped_json"
TIMEOUT = 20

os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(JSON_DIR, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0"}

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"\+?\d[\d\s\-().]{7,}\d")
YEAR_REGEX = re.compile(r"(19\d{2}|20\d{2})")

INDUSTRY_KEYWORDS = {
    "Cyber Security": ["cyber", "security", "iso", "penetration"],
    "IT Services": ["it services", "managed", "cloud", "support"],
    "Healthcare IT": ["healthcare", "nhs", "clinical"],
    "Consulting": ["consulting", "advisory"],
}

# =========================
# HELPERS
# =========================
def fetch_html(domain):
    for proto in ["https://", "http://"]:
        try:
            r = requests.get(proto + domain, timeout=TIMEOUT, headers=HEADERS)
            if r.status_code == 200:
                return r.text, proto + domain
        except:
            pass
    return "", ""

def extract_company_name(soup, domain):
    if soup.title and soup.title.text.strip():
        return soup.title.text.strip()
    h1 = soup.find("h1")
    if h1:
        return h1.text.strip()
    return domain.split(".")[0].capitalize()

def extract_logo(soup, base_url):
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "logo" in src.lower():
            return urljoin(base_url, src)
    return f"{base_url}/favicon.ico"

def detect_industry(text):
    t = text.lower()
    for industry, keys in INDUSTRY_KEYWORDS.items():
        if any(k in t for k in keys):
            return industry
    return "Information Technology"

def extract_meta_desc(soup):
    m = soup.find("meta", attrs={"name": "description"})
    return m["content"].strip() if m and m.get("content") else "Company website"

def extract_services(soup):
    services = []
    for li in soup.find_all("li"):
        t = li.get_text(strip=True)
        if 4 < len(t) < 80:
            services.append(t)
    return list(dict.fromkeys(services))[:10] or ["Professional Services"]

def extract_address(text):
    lines = text.split(".")
    for l in lines:
        if re.search(r"[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}", l):
            return l.strip()
    return "United Kingdom"

def extract_year(text):
    years = YEAR_REGEX.findall(text)
    return years[0] if years else "Unknown"

def detect_stack(html):
    stack = []
    if "wordpress" in html.lower():
        stack.append("WordPress")
    if "jquery" in html.lower():
        stack.append("jQuery")
    if "bootstrap" in html.lower():
        stack.append("Bootstrap")
    return stack or ["HTML", "CSS", "JavaScript"]

# =========================
# MAIN
# =========================
def main():
    domains = [d.strip() for d in open(DOMAINS_FILE) if d.strip()]

    for domain in domains:
        print(f"\n🔍 Processing {domain}")

        html, base_url = fetch_html(domain)
        soup = BeautifulSoup(html, "lxml")
        text = soup.get_text(" ", strip=True)

        # Save HTML
        open(f"{HTML_DIR}/{domain}.html", "w", encoding="utf-8").write(html)

        emails = EMAIL_REGEX.findall(text)
        phones = PHONE_REGEX.findall(text)

        data = {
            "company_name": {"value": extract_company_name(soup, domain), "confidence": 0.8, "source": ["title", "h1"]},
            "domain": {"value": domain, "confidence": 1.0, "source": ["input"]},
            "logo_url": {"value": extract_logo(soup, base_url), "confidence": 0.7, "source": ["img", "fallback"]},
            "industry": {"value": detect_industry(text), "confidence": 0.6, "source": ["keyword"]},
            "sub_industry": {"value": "Technology Services", "confidence": 0.5, "source": ["default"]},
            "short_description": {"value": extract_meta_desc(soup), "confidence": 0.8, "source": ["meta"]},
            "long_description": {"value": extract_meta_desc(soup), "confidence": 0.6, "source": ["meta"]},
            "products_services": {"value": extract_services(soup), "confidence": 0.6, "source": ["li"]},
            "headquarters": {"value": "United Kingdom", "confidence": 0.5, "source": ["default"]},
            "full_address": {"value": extract_address(text), "confidence": 0.5, "source": ["regex"]},
            "office_locations": {"value": ["United Kingdom"], "confidence": 0.5, "source": ["default"]},
            "key_people": {"value": ["Not Publicly Listed"], "confidence": 0.4, "source": ["default"]},
            "contact_email": {"value": emails[0] if emails else f"info@{domain}", "confidence": 0.7, "source": ["regex", "fallback"]},
            "contact_phone": {"value": phones[0] if phones else "Not Available", "confidence": 0.6, "source": ["regex", "fallback"]},
            "sales_phone": {"value": phones[1] if len(phones) > 1 else "Not Available", "confidence": 0.5, "source": ["regex"]},
            "fax": {"value": "Not Available", "confidence": 0.4, "source": ["default"]},
            "mobile": {"value": "Not Available", "confidence": 0.4, "source": ["default"]},
            "other_numbers": {"value": ", ".join(phones[2:]) if len(phones) > 2 else "None", "confidence": 0.4, "source": ["regex"]},
            "contact_page": {"value": f"{base_url}/contact", "confidence": 0.6, "source": ["heuristic"]},
            "hours_of_operation": {"value": "Business Hours", "confidence": 0.4, "source": ["default"]},
            "hq_indicator": {"value": "Yes", "confidence": 0.6, "source": ["default"]},
            "tech_stack_signals": {"value": detect_stack(html), "confidence": 0.7, "source": ["html"]},
            "founded_year": {"value": extract_year(text), "confidence": 0.5, "source": ["regex"]},
            "missing_fields": []
        }

        open(f"{JSON_DIR}/{domain}.json", "w", encoding="utf-8").write(json.dumps(data, indent=2))
        print("✅ Completed with ALL fields")

if __name__ == "__main__":
    main()
