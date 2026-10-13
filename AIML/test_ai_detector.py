
from ai_detector import detect_ai_image
import json

try:
    result = detect_ai_image("images/imagehash.png")
    print(json.dumps(result, indent=2))

except Exception as error:
    print(f"Detection failed: {type(error).__name__}: {error}")
