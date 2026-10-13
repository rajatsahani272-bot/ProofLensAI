
from pathlib import Path
from PIL import Image
import imagehash

BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "images"


def analyze_image(image_path):
    image_path = Path(image_path)

    if not image_path.is_absolute():
        image_path = BASE_DIR / image_path

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as image:
        image_format = image.format
        width, height = image.size
        image_mode = image.mode
        perceptual_hash = str(imagehash.phash(image))

        return {
            "filename": image_path.name,
            "format": image_format,
            "width": width,
            "height": height,
            "mode": image_mode,
            "perceptual_hash": perceptual_hash,
            "file_size_bytes": image_path.stat().st_size
        }
