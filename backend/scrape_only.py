import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# =====================================================
# CONFIG
# =====================================================

DOMAINS = [
    "12d.co.uk",
    "12efile.com",
    "2mghealthcare.com",
    "2mgsolutions.com",
    "a-plustech.com",
    "acassure.com",
    "accelconsulting.co.in",
    "acorncompliance.com",
    "aculabtechnologies.com",
    "acumenbay.com",
    "adas-ltd.com",
    "adoptech.co.uk",
    "advantagesouthwestsuppliers.co.uk",
    "advantum-solutions.co.uk",
    "afreespace.com",
    "aiverz.co.uk",
    "akrup.com",
    "alvao.com",
    "ambersafety.info",
    "anekanta.co.uk",
    "appliedconcepts.co.uk",
    "apvike.com",
    "aristi.co.uk",
    "arkksolutions.com",
    "arrowpcnetwork.uk",
    "ascentor.co.uk",
    "assuredprivacy.co.uk",
    "atex-inspection.com",
    "athomecomputer.uk",
    "atomosadmin.co.uk",
    "attomus.com",
    "avcosystems.com",
    "avprosystems.co.uk",
    "aware-soft.com",
    "axicon.com",
    "ayadata.ai",
    "b-612.co.uk",
    "b2bbusiness.com",
    "bgts.com",
    "connectinternetsolutions.com",
    "controlaudits.com",
    "cool-waters.co.uk",
    "corporatec.co.uk",
    "correct-group.co.uk",
    "cortida.com",
    "cplsystems.co.uk",
    "creatio.org.uk",
    "creativepeople.gr",
    "csc2.co.uk",
    "custodiatechnology.com",
    "cyberarch.co.uk",

    "bitwisegroup.com",
    "blackboots.uk",
    "blog.gradian.co.uk",
    "blog.juriba.com",
    "bluecubesecurity.com",
    "bluewolfics.com",
    "bpvltd.co.uk",
    "bridgeandshield.com",
    "brisktradeukltd.com",
    "bud.co.uk",
    "businessdispatch.co.uk",
    "c-kore.com",
    "cadcap.com",
    "capito.co.uk",
    "capture-all.co.uk",
    "cardenitservices.co.uk",
    "cas.ltd",
    "catalyicsecurity.com",
    "cawdigital.org",
    "cedat85.com",
    "ceengineering.net",
    "centerprise.co.uk",
    "centricflow.co.uk",
    "certification-experts.com",
    "cetasoft.net",
    "chcnav.com",
    "chess-dynamics.com",
    "cirs-group.com",
    "clarlabs.com",
    "clearcoursehealth.com",
    "clearcutcyber.com",
    "clenergy-ev.com",
    "clevagroup.co.uk",
    "clinisafe.com",
    "cloud10.it",
    "cloudlink.ae",
    "cloudthat.com",
    "clubspark.com",
    "clydecomputing.co.uk",
    "coalesceit.co.uk",
    "coauthor.app",
    "cobuilder.com",
    "codasecurity.co.uk",
    "codelsoftware.com",
    "codemina.com",
    "codingketchup.com",
    "cognidox.com",
    "cognisoft.co.uk",
    "cognisys.co.uk",
    "colewood.digital",
    "combinedesign.com",
    "complexcoldforming.com",
    "compliancedirectsolutions.com",
    "compliancemanager.ie",
    "comply2.co.uk",
    "complyguru.com",
    "computenordic.com",
    "confidenceit.co.uk",
    "conformitysoftware.com"
]


OUTPUT_DIR = "scraped_html"
WAIT_TIME = 5

os.makedirs(OUTPUT_DIR, exist_ok=True)

# =====================================================
# SELENIUM SETUP
# =====================================================

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

# =====================================================
# SCRAPE FUNCTION
# =====================================================

def scrape_domain(domain):
    urls = [
        f"https://{domain}",
        f"https://www.{domain}"
    ]

    for url in urls:
        try:
            print(f"🌐 Scraping {url}")
            driver.get(url)
            time.sleep(WAIT_TIME)

            html = driver.page_source
            if len(html) < 2000:
                continue

            file_path = os.path.join(OUTPUT_DIR, f"{domain}.html")
            with open(file_path, "w", encoding="utf-8", errors="ignore") as f:
                f.write(html)

            print(f"✅ Saved → {file_path}")
            return

        except Exception as e:
            print(f"⚠ Error with {url}: {e}")

    print(f"❌ Failed to scrape {domain}")

# =====================================================
# RUN SCRAPING
# =====================================================

for domain in DOMAINS:
    scrape_domain(domain)

driver.quit()
print("\n🎉 Scraping completed")
