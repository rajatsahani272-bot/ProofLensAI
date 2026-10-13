
from pathlib import Path
from transformers import pipeline
from PIL import Image

MODEL_ID = "umm-maybe/AI-image-detector"

_detector = None


def load_detector():
    global _detector

    if _detector is None:
        _detector = pipeline(
            "image-classification",
            model=MODEL_ID,
            device=-1
        )

    return _detector


def detect_ai_image(image_path):
    image_path = Path(image_path)

    if not image_path.is_absolute():
        image_path = Path(__file__).resolve().parent / image_path

    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as image:
        image = image.convert("RGB")
        predictions = load_detector()(image)

    scores = []

    for prediction in predictions:
        scores.append({
            "label": prediction["label"],
            "score": round(float(prediction["score"]), 4)
        })

    return {
        "filename": image_path.name,
        "model": MODEL_ID,
        "device": "cpu",
        "status": "experimental",
        "predictions": scores,
        "warning": (
            "Model scores are experimental signals, not proof "
            "of image authenticity."
        )
    }
