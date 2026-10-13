
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def analyze_with_groq(text):
    if not API_KEY:
        raise ValueError("GROQ_API_KEY .env file mein nahi mili.")

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Analysis ke liye non-empty text required hai.")

    client = Groq(api_key=API_KEY)

    system_prompt = """
You are ProofLens AI, an evidence-aware image text analysis assistant.

Analyze the OCR text and any supplied image metadata.

Your task is to identify factual assertions that can be checked against
external evidence. Do not confuse text extraction with fact verification.

Return exactly one JSON object with this schema:
{
  "has_verifiable_claim": true,
  "main_claim": "A factual assertion extracted from the input",
  "claim_type": "historical, scientific, political, product, identity, repository, or other",
  "reason": "Brief explanation",
  "extracted_references": [],
  "additional_claims": []
}

Rules:

1. Use only information explicitly present in the supplied input.
2. Do not invent missing details or add facts from your own knowledge.
3. Preserve the meaning of the original text.
4. A URL alone is a reference, not automatically a factual assertion.
5. If a URL appears in the input, preserve it in extracted_references.
6. Do not claim that a URL is authentic, safe, active, or trustworthy
   without external verification.
7. If the text says a repository is hosted at a URL, that hosting statement
   may be a verifiable claim.
8. If the text only contains a URL without an accompanying factual
   assertion, set has_verifiable_claim to false and main_claim to "".
9. If the text contains a factual assertion, express it as a concise,
   standalone statement that can be independently checked.
10. Do not turn a repository reference into a claim about its authenticity,
    authorship, creation date, or location unless the input explicitly
    makes that assertion.
11. If there are multiple independent factual claims, put the primary
    claim in main_claim and the others in additional_claims.
12. additional_claims must be a list of strings.
13. extracted_references must be a list of strings.
14. If there is no verifiable factual assertion, use:
    has_verifiable_claim = false,
    main_claim = "",
    claim_type = "none".
15. The reason must explain why a factual claim was or was not identified.
16. Return valid JSON only, without Markdown fences or commentary.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": text
            }
        ],
        response_format={"type": "json_object"},
        temperature=0
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq ne empty response return kiya.")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as error:
        raise ValueError(
            f"Groq response valid JSON nahi hai: {error}"
        ) from error

    if not isinstance(result, dict):
        raise ValueError("Groq response JSON object hona chahiye.")

    if not isinstance(result.get("has_verifiable_claim"), bool):
        raise ValueError(
            "Groq response mein claim status invalid hai."
        )

    if not isinstance(result.get("main_claim"), str):
        raise ValueError(
            "Groq response mein main_claim invalid hai."
        )

    if not isinstance(result.get("claim_type"), str):
        raise ValueError(
            "Groq response mein claim_type invalid hai."
        )

    if not isinstance(result.get("reason"), str):
        raise ValueError(
            "Groq response mein reason invalid hai."
        )

    if not isinstance(result.get("extracted_references", []), list):
        raise ValueError(
            "Groq response mein extracted_references invalid hain."
        )

    if not isinstance(result.get("additional_claims", []), list):
        raise ValueError(
            "Groq response mein additional_claims invalid hain."
        )

    if not result["has_verifiable_claim"]:
        result["main_claim"] = ""
        result["claim_type"] = "none"

    elif not result["main_claim"].strip():
        raise ValueError(
            "Claim status true hai, lekin main_claim empty hai."
        )

    result.setdefault("extracted_references", [])
    result.setdefault("additional_claims", [])

    result["extracted_references"] = [
        item.strip()
        for item in result["extracted_references"]
        if isinstance(item, str) and item.strip()
    ]

    result["additional_claims"] = [
        item.strip()
        for item in result["additional_claims"]
        if isinstance(item, str) and item.strip()
    ]

    return {
        "model": MODEL_NAME,
        "analysis": result
    }


if __name__ == "__main__":
    try:
        samples = [
            "https://github.com/JohannesBuchner/imagehash",
            (
                "The ImageHash Python library is hosted at "
                "https://github.com/JohannesBuchner/imagehash."
            ),
            (
                "The ImageHash Python library was created "
                "on Mars in 2026."
            )
        ]

        for sample in samples:
            print(f"\nINPUT: {sample}")

            result = analyze_with_groq(sample)

            print(
                json.dumps(
                    result,
                    indent=2,
                    ensure_ascii=False
                )
            )

    except Exception as error:
        print(
            f"Groq request failed: "
            f"{type(error).__name__}: {error}"
        )
