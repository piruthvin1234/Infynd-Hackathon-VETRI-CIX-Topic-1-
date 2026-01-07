import requests
import json

def test_register():
    url = "http://localhost:8000/auth/register"
    data = {
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
