
import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parent / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY .env mein nahi mili.")

client = genai.Client(api_key=api_key)

for model in client.models.list():
    name = getattr(model, "name", None)

    if name and "flash" in name.lower():
        print(name)
