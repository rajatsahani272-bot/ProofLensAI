
import asyncio
import os
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent
AIML_DIR = (BASE_DIR.parent / "AIML").resolve()

load_dotenv(AIML_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

if not AIML_DIR.is_dir():
    raise RuntimeError(f"AIML folder not found: {AIML_DIR}")

sys.path.insert(0, str(AIML_DIR))

from pipeline import analyze_image_pipeline

app = FastAPI(
    title="ProofLens AI Service",
    version="1.0.0"
)

API_KEY = os.getenv("AI_SERVICE_API_KEY", "")
MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


@app.get("/health")
def health_check():
    return {
        "success": True,
        "service": "ProofLens AI Service",
        "status": "running"
    }


@app.post("/analyze")
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    x_ai_service_key: str | None = Header(default=None)
):
    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="AI_SERVICE_API_KEY is not configured"
        )

    if x_ai_service_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid service API key"
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG and WebP images are supported"
        )

    temp_path = None

    try:
        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty"
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image size must not exceed 10 MB"
            )

        try:
            with Image.open(__import__("io").BytesIO(content)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise HTTPException(
                        status_code=415,
                        detail="Unsupported image format"
                    )
                image.verify()
        except (UnidentifiedImageError, OSError, ValueError):
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted image"
            )

        suffix = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp"
        }[file.content_type]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        result = await asyncio.to_thread(
            analyze_image_pipeline,
            temp_path
        )

        return {
            "success": True,
            "report": result
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(error)}"
        ) from error
    finally:
        await file.close()

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
