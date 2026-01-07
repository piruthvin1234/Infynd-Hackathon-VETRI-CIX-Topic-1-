"""
Test script for HTML Cache Service
Tests the caching mechanism for scraped HTML files
"""

from html_cache_service import html_cache_service
import time

def test_cache_service():
    print("=" * 60)
    print("HTML CACHE SERVICE TEST")
    print("=" * 60)
    
    # Test URLs
    test_urls = [
        "12d.co.uk",
        "acassure.com",
        "example.com"  # This one won't be in cache
    ]
    
    print("\n1. Testing Cache Info (Initial State)")
    print("-" * 60)
    cache_info = html_cache_service.get_cache_info()
    print(f"Total cached files: {cache_info['total_files']}")
    print(f"Total cache size: {cache_info['total_size_mb']} MB")
    print(f"First 5 cached domains:")
    for file in cache_info['files'][:5]:
        print(f"  - {file['domain']} ({file['size_mb']} MB)")
    
    print("\n2. Testing Cache Hit (Should use cached file)")
    print("-" * 60)
    start = time.time()
    html1 = html_cache_service.get_html(test_urls[0])
    elapsed1 = time.time() - start
    if html1:
        print(f"✅ Retrieved {test_urls[0]}: {len(html1)} bytes in {elapsed1:.2f}s")
    else:
        print(f"❌ Failed to retrieve {test_urls[0]}")
    
    print("\n3. Testing Cache Hit Again (Should be instant)")
    print("-" * 60)
    start = time.time()
    html2 = html_cache_service.get_html(test_urls[0])
    elapsed2 = time.time() - start
    if html2:
        print(f"✅ Retrieved {test_urls[0]}: {len(html2)} bytes in {elapsed2:.2f}s")
        print(f"⚡ Speed improvement: {elapsed1/elapsed2:.1f}x faster")
    
    print("\n4. Testing Cache Miss (Will scrape if not exists)")
    print("-" * 60)
    print(f"⚠️  Note: This will use Selenium to scrape {test_urls[2]}")
    print("    This may take 5-10 seconds...")
    start = time.time()
    html3 = html_cache_service.get_html(test_urls[2])
    elapsed3 = time.time() - start
    if html3:
        print(f"✅ Retrieved {test_urls[2]}: {len(html3)} bytes in {elapsed3:.2f}s")
    else:
        print(f"❌ Failed to retrieve {test_urls[2]}")
    
    print("\n5. Testing Force Refresh")
    print("-" * 60)
    print(f"⚠️  Force refreshing {test_urls[1]} (will re-scrape)")
    start = time.time()
    html4 = html_cache_service.get_html(test_urls[1], force_refresh=True)
    elapsed4 = time.time() - start
    if html4:
        print(f"✅ Refreshed {test_urls[1]}: {len(html4)} bytes in {elapsed4:.2f}s")
    
    print("\n6. Final Cache Info")
    print("-" * 60)
    cache_info = html_cache_service.get_cache_info()
    print(f"Total cached files: {cache_info['total_files']}")
    print(f"Total cache size: {cache_info['total_size_mb']} MB")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    test_cache_service()
