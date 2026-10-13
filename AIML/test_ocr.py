
from ocr_engine import extract_text

try:
    result = extract_text("images/imagehash.png")

    print("\nOCR Result")
    print("-" * 30)
    print("Filename:", result["filename"])
    print("Text count:", result["text_count"])

    for item in result["extracted_text"]:
        print(f'Text: {item["text"]}')
        print(f'Confidence: {item["confidence"]}')

except Exception as error:
    print(f"OCR failed: {error}")
