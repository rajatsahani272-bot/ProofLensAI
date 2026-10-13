
from image_processing import analyze_image

image_path = "images/imagehash.png"

try:
    result = analyze_image(image_path)

    print("\nImage Analysis Result")
    print("-" * 30)

    for key, value in result.items():
        print(f"{key}: {value}")

except (FileNotFoundError, OSError, ValueError) as error:
    print(f"Error: {error}")
