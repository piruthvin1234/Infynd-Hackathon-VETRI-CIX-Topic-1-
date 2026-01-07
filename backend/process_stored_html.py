import os
import json
import time
from extractor import process_html_content
from llm_service import extract_company_data

# Directories
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
SCRAPED_HTML_DIR = os.path.join(BACKEND_DIR, "scraped_html")
SCRAPED_JSON_DIR = os.path.join(BACKEND_DIR, "scraped_json")

def process_stored_html_files():
    # 1. Create scraped_json directory if it doesn't exist
    if not os.path.exists(SCRAPED_JSON_DIR):
        print(f"Creating directory: {SCRAPED_JSON_DIR}")
        os.makedirs(SCRAPED_JSON_DIR)
    
    # 2. List all HTML files
    if not os.path.exists(SCRAPED_HTML_DIR):
        print(f"Error: {SCRAPED_HTML_DIR} does not exist.")
        return

    files = [f for f in os.listdir(SCRAPED_HTML_DIR) if f.lower().endswith(".html")]
    total_files = len(files)
    print(f"Found {total_files} HTML files to process.")

    for index, filename in enumerate(files):
        print(f"\n[{index + 1}/{total_files}] Processing {filename}...")
        
        # Construct paths
        html_path = os.path.join(SCRAPED_HTML_DIR, filename)
        
        # Derive generic domain name from filename for URL context
        # Example: "example.com.html" -> "example.com"
        domain_guess = filename.rsplit('.html', 1)[0]
        # remove any " (1)" duplicates if present
        domain_guess = domain_guess.split(' ')[0]
        
        json_filename = f"{domain_guess}.json"
        json_path = os.path.join(SCRAPED_JSON_DIR, json_filename)

        # Check if JSON already exists (skip to save time/money if re-running)
        if os.path.exists(json_path):
            print(f"  -> JSON already exists for {filename}, skipping...")
            # Load and check if empty? For now just skip.
            continue

        try:
            # 3. Read HTML Content
            with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_html = f.read()
            
            # 4. Clean and Extract Text/Signals using extractor.py logic
            # clean_text contains the text payload for the LLM
            clean_text, tech_signals = process_html_content(raw_html, source_name=filename)
            
            if not clean_text:
                print(f"  -> Warning: No text extracted from {filename}")
                continue

            # 5. Send to LLM Service
            # We pass a constructed URL to help the LLM infer the domain if missing in text
            simulated_url = f"https://{domain_guess}"
            
            print(f"  -> Sending to LLM (Domain: {domain_guess})...")
            extracted_data = extract_company_data(clean_text, tech_signals, url=simulated_url)
            
            if extracted_data:
                # 6. Save valid JSON
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(extracted_data, f, indent=4)
                print(f"  -> ✅ Saved to {json_filename}")
            else:
                print(f"  -> ❌ Failed to extract data for {filename}")

        except Exception as e:
            print(f"  -> ❌ Error processing {filename}: {e}")
        
        # Optional: Sleep briefly to prevent rate limiting if using external API (Groq)
        # fast local LLMs might not need this, but good practice.
        # time.sleep(1) 

    print("\nBatch processing complete!")

if __name__ == "__main__":
    process_stored_html_files()
