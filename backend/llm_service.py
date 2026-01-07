import requests
import json
import os
import re
import time
from typing import Dict, Any, List, Optional
from models import CompanyProfile

# Local LLM Configuration (AirLLM / Phi-3)
LOCAL_LLM_URL = "http://localhost:9000/v1/chat/completions"

# Secondary Local LLM (Ollama / Mistral)
OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "mistral:latest"


PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "company_extraction_prompt.txt")

def load_prompt_template() -> str:
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Prompt file not found at {PROMPT_PATH}")
        return ""

def _sanitize_input_text(s: str) -> str:
    try:
        return "".join(ch for ch in s if ch.isprintable() or ch in "\n\r\t")
    except Exception:
        try:
            return s.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
        except Exception:
            return s[:100000]

def _extract_first_json(text: str) -> Optional[str]:
    if not text:
        return None
    start_indices = [i for i, ch in enumerate(text) if ch in "[{"]
    for start in start_indices:
        opening = text[start]
        closing = '}' if opening == '{' else ']' if opening == '[' else '"'
        if opening in '{[':
            depth = 0
            in_str = False
            esc = False
            for i in range(start, len(text)):
                ch = text[i]
                if in_str:
                    if esc:
                        esc = False
                    elif ch == '\\':
                        esc = True
                    elif ch == '"':
                        in_str = False
                    continue
                if ch == '"':
                    in_str = True
                elif ch == opening:
                    depth += 1
                elif ch == closing:
                    depth -= 1
                    if depth == 0:
                        return text[start:i+1]
        else:
            end = text.find('"', start+1)
            if end != -1:
                return text[start:end+1]
    return None

def query_local_llm(prompt: str) -> Optional[str]:
    """Query Local AirLLM service (Phi-3)"""
    print("🚀 Querying Primary: Local AirLLM (Phi-3)...")
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "phi-3-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that extracts company data in JSON format."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 4096,
    }
    
    try:
        # User requested 5 minute wait time for local model
        response = requests.post(LOCAL_LLM_URL, headers=headers, json=payload, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            if content:
                print("✅ Primary LLM Response Received")
                return content
        else:
            print(f"⚠️ Primary LLM Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏱️ Primary LLM Timed Out (> 300s)")
    except requests.exceptions.ConnectionError:
        print("⚠️ Could not connect to Primary LLM (Is it running on port 9000?)")
    except Exception as e:
        print(f"⚠️ Primary LLM Exception: {e}")
        
    return None

def query_ollama(prompt: str) -> Optional[str]:
    """Query Secondary Local LLM (Ollama / Mistral)"""
    print("🦙 Querying Secondary: Ollama (Mistral)...")
    
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "format": "json" # Force JSON mode if supported by model/ollama version
    }
    
    try:
        # 2 minute timeout for Ollama
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("message", {}).get("content", "")
            if content:
                print("✅ Secondary LLM (Ollama) Response Received")
                return content
        else:
            print(f"⚠️ Ollama Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏱️ Ollama Timed Out (> 120s)")
    except requests.exceptions.ConnectionError:
        print("⚠️ Could not connect to Ollama (Is it running on port 11434?)")
    except Exception as e:
        print(f"⚠️ Ollama Exception: {e}")
        
    return None

def query_groq(prompt: str) -> str:
    """Fallback: Query Groq API"""
    print("☁️ Fallback: Querying Groq API (Llama-3)...")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": """You are an expert company intelligence extraction agent. Your job is to extract MAXIMUM information from website content.

CRITICAL INSTRUCTIONS:
1. Read the ENTIRE content carefully - don't skip sections
2. Extract EVERY piece of information you find
3. For descriptions: Combine multiple paragraphs to create comprehensive summaries
4. For people: Look for ANY names with titles (CEO, CTO, Founder, Director, VP, President, etc.)
5. For locations: Check footers, contact sections, "About" pages for addresses
6. For contact info: Search thoroughly in footers, contact pages, mailto: links
7. For logo: Look for LOGO_URLS_FOUND or EMAILS_FOUND in the content
8. Return ONLY valid JSON - no markdown, no explanations
9. Use confidence scores honestly: 1.0 (certain), 0.8 (very likely), 0.6 (likely), 0.4 (inferred)

BE THOROUGH - Missing data means you didn't look hard enough!"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.2,
        "max_tokens": 4096,
        "top_p": 0.9,
        "response_format": {"type": "json_object"}
    }
    
    for attempt in range(3):
        try:
            response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
            if response.status_code == 200:
                result = response.json()
                return result.get("choices", [{}])[0].get("message", {}).get("content", "")
            else:
                print(f"Groq Error Status: {response.status_code}")
                # Simple retry logic
                if attempt < 2:
                    time.sleep(2)
                    continue
        except Exception as e:
            print(f"Error querying Groq: {e}")
            if attempt < 2:
                time.sleep(2)
                continue
    return ""

def query_llm_strategy(prompt: str) -> str:
    """
    Triple-strategy query:
    1. Try Primary Local (AirLLM/Phi-3) [Timeout: 5m]
    2. Try Secondary Local (Ollama/Mistral) [Timeout: 2m]
    3. Fallback to Cloud (Groq)
    """
    # 1. Primary: AirLLM
    result = query_local_llm(prompt)
    if result:
        return result
    
    print("🔄 Primary LLM failed. Switching to Secondary (Ollama)...")
    
    # 2. Secondary: Ollama
    result = query_ollama(prompt)
    if result:
        return result
        
    # 3. Fallback: Groq
    print("🔄 Secondary LLM failed. Switching to Fallback (Groq)...")
    return query_groq(prompt)

def extract_company_data(text_content: str, tech_signals: List[str], url: Optional[str] = None) -> Dict[str, Any]:
    template = load_prompt_template()
    if not template:
        return {}
    
    # Increased to 30000 characters for more comprehensive extraction
    sanitized_text = _sanitize_input_text(text_content)
    prompt = template.replace("{{WEBSITE_TEXT_HERE}}", sanitized_text[:30000])
    
    print("="*80)
    print("SENDING TO AI (first 800 chars):")
    print(sanitized_text[:800])
    print("="*80)
    
    # Use Dual Strategy
    response_text = query_llm_strategy(prompt)
    
    print("="*80)
    print("AI RESPONSE (first 1000 chars):")
    print(response_text[:1000] if response_text else "EMPTY")
    print("="*80)
    
    try:
        data = json.loads(response_text)
        
        if not isinstance(data, dict):
            print("LLM returned non-dict JSON")
            return {}

        # Normalize data: ensure all fields are in FieldData format
        string_fields = [
            "company_name", "domain", "logo_url", "industry", "sub_industry",
            "short_description", "long_description", "headquarters", "full_address",
            "contact_email", "contact_phone", "sales_phone", "fax", "mobile",
            "other_numbers", "contact_page", "founded_year", "hours_of_operation",
            "hq_indicator"
        ]
        list_fields = [
            "products_services", "office_locations", "tech_stack_signals"
        ]
        
        # Normalize each field to FieldData structure
        for key in string_fields:
            if key in data:
                if not isinstance(data[key], dict):
                    # Handle case where LLM returns a list for a string field
                    if isinstance(data[key], list):
                        data[key] = {
                            "value": ", ".join(str(x) for x in data[key] if x),
                            "confidence": 0.5,
                            "source": ["LLM"]
                        }
                    else:
                        data[key] = {"value": data[key] or "", "confidence": 0.5, "source": ["LLM"]}
                else:
                    # Handle case where value inside dict is a list
                    if isinstance(data[key].get("value"), list):
                        data[key]["value"] = ", ".join(str(x) for x in data[key]["value"] if x)
                    elif data[key].get("value") is None:
                        data[key]["value"] = ""
                    
        for key in list_fields:
            if key in data:
                if isinstance(data[key], list):
                    if key == "office_locations":
                        normalized_locations = []
                        for loc in data[key]:
                            if isinstance(loc, dict):
                                parts = []
                                if loc.get('city'):
                                    parts.append(loc['city'])
                                if loc.get('country'):
                                    parts.append(loc['country'])
                                if loc.get('state'):
                                    parts.insert(1 if 'city' in loc else 0, loc['state'])
                                normalized_locations.append(", ".join(parts) if parts else str(loc))
                            else:
                                normalized_locations.append(str(loc))
                        data[key] = {"value": normalized_locations, "confidence": 0.5, "source": ["LLM"]}
                    else:
                        data[key] = {"value": data[key], "confidence": 0.5, "source": ["LLM"]}
                elif isinstance(data[key], dict):
                    if data[key].get("value") is None:
                        data[key]["value"] = []
                    elif key == "office_locations" and isinstance(data[key].get("value"), list):
                        normalized_locations = []
                        for loc in data[key]["value"]:
                            if isinstance(loc, dict):
                                parts = []
                                if loc.get('city'):
                                    parts.append(loc['city'])
                                if loc.get('country'):
                                    parts.append(loc['country'])
                                if loc.get('state'):
                                    parts.insert(1 if 'city' in loc else 0, loc['state'])
                                normalized_locations.append(", ".join(parts) if parts else str(loc))
                            else:
                                normalized_locations.append(str(loc))
                        data[key]["value"] = normalized_locations
                else:
                    data[key] = {"value": [], "confidence": 0.0, "source": []}
        
        if "key_people" in data:
            def _normalize_people_list(lst):
                norm = []
                for p in lst or []:
                    if isinstance(p, dict):
                        name = str(p.get("name", "") or "")
                        title = str(p.get("title", "") or "")
                        role_category = str(p.get("role_category", "") or "")
                        if name:
                            norm.append({"name": name, "title": title, "role_category": role_category})
                    elif isinstance(p, str):
                        if p:
                            norm.append({"name": p, "title": "", "role_category": ""})
                return norm
            if isinstance(data["key_people"], list):
                kp = _normalize_people_list(data["key_people"])
                data["key_people"] = {"value": kp, "confidence": 0.5, "source": ["LLM"]}
            elif isinstance(data["key_people"], dict):
                if data["key_people"].get("value") is None:
                    data["key_people"]["value"] = []
                else:
                    data["key_people"]["value"] = _normalize_people_list(data["key_people"].get("value", []))
            else:
                data["key_people"] = {"value": [], "confidence": 0.0, "source": []}

        # Merge heuristic tech signals
        if "tech_stack_signals" not in data:
            data["tech_stack_signals"] = {"value": [], "confidence": 0.0, "source": []}
        
        current_stack = set(data["tech_stack_signals"].get("value", []))
        for signal in tech_signals:
            if signal not in current_stack:
                current_stack.add(signal)
        
        data["tech_stack_signals"]["value"] = list(current_stack)
        if tech_signals and data["tech_stack_signals"]["confidence"] < 0.5:
            data["tech_stack_signals"]["confidence"] = 0.8
            if "Heuristic Analysis" not in data["tech_stack_signals"]["source"]:
                data["tech_stack_signals"]["source"].append("Heuristic Analysis")

        # Intelligent fallbacks
        if not data.get("logo_url", {}).get("value"):
            domain = data.get("domain", {}).get("value", "")
            if domain:
                data["logo_url"] = {
                    "value": f"https://{domain}/logo.png",
                    "confidence": 0.3,
                    "source": ["Inferred from domain"]
                }
        if not data.get("contact_email", {}).get("value"):
            domain = data.get("domain", {}).get("value", "")
            if domain:
                clean = re.sub(r'^https?://', '', domain).strip().lower()
                if clean.startswith('www.'):
                    clean = clean[4:]
                clean = clean.split('/')[0].rstrip('.')
                data["contact_email"] = {
                    "value": f"info@{clean}",
                    "confidence": 0.3,
                    "source": ["Inferred from domain"]
                }
        
        # Fix contact_page to be full URL
        if data.get("contact_page", {}).get("value"):
            contact_page = data["contact_page"]["value"]
            domain = data.get("domain", {}).get("value", "")
            
            # If it's a relative path like "/contact", make it absolute
            if contact_page.startswith("/") and domain:
                data["contact_page"]["value"] = f"https://{domain}{contact_page}"
            elif not contact_page.startswith("http") and domain:
                # If it's just "contact" without leading slash
                data["contact_page"]["value"] = f"https://{domain}/{contact_page}"

        # Final domain normalization
        domain_val = data.get("domain", {}).get("value", "")
        
        # If domain is missing or suspicious (like a path), try to get it from the URL
        if (not domain_val or domain_val.startswith('/')) and url:
            # Extract domain from URL
            match = re.search(r'https?://([^/]+)', url)
            if match:
                domain_val = match.group(1)
            else:
                domain_val = url.split('/')[0]

        if domain_val:
            domain_val = domain_val.strip().lower()
            # Remove protocol if present
            domain_val = re.sub(r'^https?://', '', domain_val)
            # Remove trailing slash
            domain_val = domain_val.rstrip('/')
            
            # If it still looks like a path (contains / after protocol removal), try to extract domain
            if '/' in domain_val:
                domain_val = domain_val.split('/')[0]
            
            # Ensure www. prefix as requested
            if domain_val and not domain_val.startswith('www.'):
                # Check if it's an IP address (shouldn't have www.)
                if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain_val):
                    domain_val = f"www.{domain_val}"
            
            if "domain" not in data:
                data["domain"] = {"value": domain_val, "confidence": 0.5, "source": ["URL Extraction"]}
            else:
                data["domain"]["value"] = domain_val

        return data
    except json.JSONDecodeError:
        extracted = _extract_first_json(response_text)
        if extracted:
            try:
                data = json.loads(extracted)
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
        print("Failed to parse JSON from LLM response")
        print("Raw Response:", response_text)
        return {}
