
from pathlib import Path
from paddleocr import PaddleOCR

BASE_DIR = Path(__file__).resolve().parent

ocr = PaddleOCR(
    lang="en",
    device="cpu",
    enable_mkldnn=False,
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)


def extract_text(image_path):
    image_path = Path(image_path)

    if not image_path.is_absolute():
        image_path = BASE_DIR / image_path

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    results = ocr.predict(input=str(image_path))

    extracted_items = []

    for result in results:
        data = result.json
        if callable(data):
            data = data()

        if isinstance(data, dict):
            data = data.get("res", data)

        texts = data.get("rec_texts", [])
        scores = data.get("rec_scores", [])

        for index, text in enumerate(texts):
            confidence = scores[index] if index < len(scores) else None

            extracted_items.append({
                "text": text,
                "confidence": float(confidence) if confidence is not None else None
            })

    return {
        "filename": image_path.name,
        "text_count": len(extracted_items),
        "extracted_text": extracted_items
    }
