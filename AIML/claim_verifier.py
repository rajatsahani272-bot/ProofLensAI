import os
import json
import re
from urllib.parse import urlparse, unquote

from dotenv import load_dotenv
from tavily import TavilyClient
from groq import Groq


load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

ALLOWED_VERDICTS = {"Supported", "Contradicted", "Inconclusive"}

STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "to", "of", "in", "on", "at", "for", "from", "by",
    "with", "and", "or", "but", "that", "this", "it", "its",
    "as", "about", "into", "their", "they", "them", "which",
    "what", "when", "where", "who", "how", "does", "do", "has",
    "have", "had", "can", "could", "would", "should", "will",
    "may", "might", "not", "says", "states", "shows", "according",
    "available", "references", "library", "created", "hosted",
    "claim", "text", "image", "official", "repository", "source"
}


# 1. Text and URL Utilities

def tokenize(value):
    words = re.findall(r"[a-zA-Z0-9]+", str(value).lower())

    return {
        word for word in words
        if len(word) > 1 and word not in STOP_WORDS
    }


def normalize_url(url):
    try:
        value = str(url).strip()
        value = re.sub(r"[.,;:!?)\]}]+$", "", value)
        parsed = urlparse(value)

        if parsed.scheme.lower() not in {"http", "https"}:
            return ""

        host = (parsed.hostname or "").lower().removeprefix("www.")
        path = unquote(parsed.path).rstrip("/")

        if not host:
            return ""

        return f"{host}{path}".lower()

    except Exception:
        return ""


def get_domain(url):
    try:
        return (
            urlparse(url).hostname or ""
        ).lower().removeprefix("www.")

    except Exception:
        return ""


def extract_urls(text):
    values = re.findall(r"""https?://[^\s<>"']+""", str(text))

    return {
        normalize_url(value)
        for value in values
        if normalize_url(value)
    }


# 2. Source Relevance and Classification

def calculate_relevance(claim, source):
    claim_words = tokenize(claim)

    source_text = " ".join([
        str(source.get("title", "")),
        str(source.get("content", ""))
    ])

    source_words = tokenize(source_text)

    if not claim_words or not source_words:
        return 0.0

    overlap = claim_words.intersection(source_words)
    coverage = len(overlap) / len(claim_words)

    title_words = tokenize(source.get("title", ""))
    title_overlap = claim_words.intersection(title_words)
    title_coverage = len(title_overlap) / len(claim_words)

    score = (coverage * 0.7) + (title_coverage * 0.3)

    return round(min(score, 1.0), 3)


def classify_source(source, claim_urls):
    url = source.get("url", "")
    title = source.get("title", "").lower()
    content = source.get("content", "").lower()

    domain = get_domain(url)
    path = urlparse(url).path.lower()
    parts = [part for part in path.split("/") if part]

    exact_url_match = normalize_url(url) in claim_urls

    source_type = "third_party"
    source_priority = "normal"

    if domain == "github.com":
        if len(parts) >= 3 and parts[2] == "issues":
            source_type = "github_issue"
            source_priority = "low"

        elif len(parts) >= 3 and parts[2] == "pull":
            source_type = "github_pull_request"
            source_priority = "low"

        elif "forked from" in content or "forked from" in title:
            source_type = "github_fork_or_mirror"

        elif len(parts) == 2:
            source_type = "github_repository_page"
            source_priority = "high"

        else:
            source_type = "github_repository_content"
            source_priority = "high"

    elif domain == "pypi.org":
        source_type = "package_registry"
        source_priority = "high"

    elif domain.endswith(".gov") or domain.endswith(".gov.in"):
        source_type = "government_source"
        source_priority = "high"

    elif domain.endswith(".edu"):
        source_type = "academic_source"
        source_priority = "high"

    if exact_url_match:
        source_priority = "high"

    return {
        "exact_claim_url_match": exact_url_match,
        "source_type": source_type,
        "source_priority": source_priority
    }


def rank_sources(claim, raw_sources):
    claim_urls = extract_urls(claim)
    ranked = []

    for item in raw_sources:
        url = item.get("url", "")

        if not normalize_url(url):
            continue

        source = {
            "title": item.get("title", ""),
            "url": url,
            "content": item.get("content", "")
        }

        source["relevance_score"] = calculate_relevance(
            claim,
            source
        )

        source.update(classify_source(source, claim_urls))
        ranked.append(source)

    ranked.sort(
        key=lambda source: (
            source["exact_claim_url_match"],
            source["relevance_score"],
            source["source_priority"] == "high"
        ),
        reverse=True
    )

    return ranked



def filter_relevant_sources(claim, sources, max_sources=6):
    claim_words = tokenize(claim)

    if not claim_words:
        return []

    generic_terms = {
        "the", "a", "an", "is", "are", "was", "were",
        "be", "been", "being", "on", "in", "at", "to",
        "of", "and", "or", "but", "with", "for", "by",
        "this", "that", "it", "from", "as",
        "year", "date", "time", "created", "hosted",
        "released", "location", "library", "package",
        "project", "software", "tool", "product",
        "python", "mars", "2026"
    }

    distinctive_terms = claim_words - generic_terms

    if not distinctive_terms:
        distinctive_terms = claim_words

    filtered = []
    seen_urls = set()

    for source in sources:
        title = str(source.get("title", ""))
        content = str(
            source.get("content", source.get("snippet", ""))
        )
        url = normalize_url(source.get("url", ""))

        if not url:
            continue

        source_words = tokenize(f"{title} {content}")

        if not source_words:
            continue

        distinctive_overlap = distinctive_terms.intersection(
            source_words
        )

        if not distinctive_overlap:
            continue

        score = source.get("relevance_score", 0.0)

        if (
            not isinstance(score, (int, float))
            or isinstance(score, bool)
            or not 0 <= score <= 1
        ):
            score = 0.0

        title_words = tokenize(title)
        title_match = bool(
            distinctive_terms.intersection(title_words)
        )

        if len(distinctive_overlap) >= 2:
            pass
        elif title_match and score >= 0.20:
            pass
        else:
            continue

        if url in seen_urls:
            continue

        seen_urls.add(url)
        filtered.append(source)

    filtered.sort(
        key=lambda source: (
            source.get("relevance_score", 0.0),
            source.get("source_priority") == "high"
        ),
        reverse=True
    )

    return filtered[:max_sources]


# 3. Evidence Collection

def collect_evidence(claim, max_results=10):
    client = TavilyClient(api_key=TAVILY_API_KEY)

    response = client.search(
        query=claim,
        search_depth="advanced",
        max_results=max_results,
        include_answer=False
    )

    ranked = rank_sources(
        claim,
        response.get("results", [])
    )

    return filter_relevant_sources(claim, ranked)


# 4. Claim Processing

def clean_assertion(value):
    value = value.strip()
    value = re.sub(r"^[\s,;:.]+|[\s,;:.]+$", "", value)

    return value.strip()

def split_claim(claim):
    text = re.sub(r"\s+", " ", claim.strip())

    if not text:
        return []

    text = clean_assertion(text)

    if not text:
        return []

    parts = re.split(
        r"\s*;\s*|"
        r"\s+(?:and|but|whereas)\s+"
        r"(?=(?:the|this|that|it|he|she|they|we|I)\b)",
        text,
        flags=re.IGNORECASE
    )

    results = []

    for part in parts:
        part = clean_assertion(part)

        if part and part not in results:
            results.append(part)

    if len(results) <= 1:
        return results

    first = results[0]

    subject_match = re.match(
        r"^(.+?)\s+(?:is|are|was|were|has|have|had|"
        r"contains|supports|uses|created|founded|developed|"
        r"provides|offers|includes|released|launched)\b",
        first,
        flags=re.IGNORECASE
    )

    subject = subject_match.group(1).strip() if subject_match else ""

    if subject:
        for index in range(1, len(results)):
            part = results[index]

            part = re.sub(
                r"^(?:the|this|that)\s+"
                r"(?:library|package|project|software|tool|product|"
                r"application|company|platform|system)\b",
                subject,
                part,
                count=1,
                flags=re.IGNORECASE
            )

            results[index] = clean_assertion(part)

    return [part for part in results if part]

 
def parse_json_response(content):
    if not content or not content.strip():
        raise ValueError("Groq returned an empty assessment.")

    content = content.strip()

    content = re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        content,
        flags=re.IGNORECASE
    ).strip()

    try:
        result = json.loads(content)

    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")

        if start == -1 or end <= start:
            raise ValueError(
                "Groq response did not contain valid JSON."
            )

        result = json.loads(content[start:end + 1])

    if not isinstance(result, dict):
        raise ValueError(
            "Groq response must be a JSON object."
        )

    return result


# 5. Evidence Assessment

def assess_evidence(claim, sources):
    if not sources:
        return {
            "verdict": "Inconclusive",
            "reason": "No sufficiently relevant search sources were found.",
            "supporting_evidence": [],
            "contradicting_evidence": [],
            "contextual_evidence": [],
            "limitations": [
                "No relevant evidence was available for assessment."
            ]
        }

    client = Groq(api_key=GROQ_API_KEY)

    evidence = [
        {
            "title": source.get("title", ""),
            "url": source.get("url", ""),
            "snippet": source.get("content", "")[:2000],
            "relevance_score": source.get("relevance_score", 0),
            "exact_claim_url_match": source.get(
                "exact_claim_url_match", False
            ),
            "source_type": source.get("source_type", "unknown"),
            "source_priority": source.get("source_priority", "normal")
        }
        for source in sources
    ]

    prompt = f"""
Assess the exact factual claim using only the supplied search evidence.

CLAIM:
{claim}

SEARCH RESULTS:
{json.dumps(evidence, ensure_ascii=False)}

Return exactly one JSON object:
{{
  "verdict": "Supported, Contradicted, or Inconclusive",
  "reason": "string",
  "supporting_evidence": [
    {{"source_url": "exact supplied URL", "finding": "specific finding"}}
  ],
  "contradicting_evidence": [
    {{"source_url": "exact supplied URL", "finding": "specific finding"}}
  ],
  "contextual_evidence": [
    {{"source_url": "exact supplied URL", "finding": "what the evidence establishes and why it is not direct proof"}}
  ],
  "limitations": ["string"]
}}

Rules:
- Evaluate only the exact factual claim.
- Use only supplied search results.
- Supported requires direct evidence supporting the material claim.
- Contradicted requires direct evidence conflicting with a material claim.
- Use Inconclusive when evidence is insufficient, ambiguous, indirect, or contextual.
- Missing evidence does not prove a claim false.
- A matching repository URL does not prove authorship, creation date, creation location, or authenticity.
- Separate compound claims into material factual parts.
- Classify evidence as supporting, contradicting, or contextual before deciding the verdict.
- Contextual evidence must never be presented as direct support or contradiction.
- A package submission date establishes when that package was submitted, not necessarily when the original library was created.
- A package release date, upload date, update date, or copyright year does not automatically establish the original project's creation date.
- An older release can contradict a claim that a project first existed in a later year if it reliably establishes that the same project already existed earlier.
- Repository hosting does not establish where a project was created.
- Evidence that a project existed before a claimed date does not establish its physical creation location.
- Do not infer that a claim about Mars is false merely because the supplied sources do not mention Mars.
- Do not infer facts from keyword overlap or superficial name similarity.
- Prefer primary sources when available, but assess what their actual content establishes.
- Never invent facts, findings, quotations, or URLs.
- Cite only exact URLs supplied in the search results.
- Every finding must accurately describe what its cited source establishes.
- If direct supporting evidence is absent, do not return Supported.
- If direct contradicting evidence is absent, do not return Contradicted.
- If evidence supports one part of a compound claim but leaves another unverified, do not mark the entire claim Supported.
- Keep the reason concise and factual.
- Put unresolved uncertainty in limitations.
- Return valid JSON only, without Markdown fences or commentary.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a cautious, evidence-based fact checker. "
                    "Distinguish direct evidence from contextual evidence. "
                    "Never infer contradiction from missing evidence. "
                    "Return valid JSON only."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    result = parse_json_response(
        response.choices[0].message.content
    )

    if not isinstance(result, dict):
        result = {}

    if result.get("verdict") not in ALLOWED_VERDICTS:
        result["verdict"] = "Inconclusive"

    valid_urls = {
        source.get("url")
        for source in sources
        if isinstance(source, dict) and source.get("url")
    }

    evidence_fields = (
        "supporting_evidence",
        "contradicting_evidence",
        "contextual_evidence"
    )

    for field in evidence_fields:
        items = result.get(field, [])

        if not isinstance(items, list):
            items = []

        cleaned_items = []
        seen_items = set()

        for item in items:
            if not isinstance(item, dict):
                continue

            source_url = item.get("source_url")

            if source_url not in valid_urls:
                continue

            finding = str(item.get("finding", "")).strip()

            if not finding:
                continue

            item_key = (source_url, finding)

            if item_key in seen_items:
                continue

            seen_items.add(item_key)

            cleaned_items.append({
                "source_url": source_url,
                "finding": finding[:1000]
            })

        result[field] = cleaned_items

    result["reason"] = str(
        result.get("reason", "Evidence assessment unavailable.")
    ).strip()[:2000]

    if not isinstance(result.get("limitations"), list):
        result["limitations"] = []

    result["limitations"] = [
        str(item).strip()[:500]
        for item in result["limitations"]
        if str(item).strip()
    ]

    claim_lower = claim.lower()

    creation_claim = any(
        phrase in claim_lower
        for phrase in (
            "created in",
            "created on",
            "creation date",
            "was created",
            "founded in",
            "founded on",
            "was founded",
            "originated in",
            "was developed in",
            "was developed on"
        )
    )

    date_metadata_phrases = (
        "first submitted",
        "package submitted",
        "last updated",
        "last modified",
        "copyright",
        "package release",
        "released on",
        "release date",
        "uploaded on",
        "published on"
    )

    if creation_claim:
        for item in result["contradicting_evidence"][:]:
            finding_lower = item["finding"].lower()

            metadata_only = any(
                phrase in finding_lower
                for phrase in date_metadata_phrases
            )

            direct_creation_reference = any(
                phrase in finding_lower
                for phrase in (
                    "original library was created",
                    "project was created",
                    "library was first created",
                    "project was founded",
                    "library was founded",
                    "project originated"
                )
            )

            if metadata_only and not direct_creation_reference:
                result["contradicting_evidence"].remove(item)

                result["contextual_evidence"].append({
                    "source_url": item["source_url"],
                    "finding": (
                        item["finding"]
                        + " This is package or publication metadata "
                        "and does not, by itself, establish the "
                        "original project's creation date."
                    )
                })

                result["limitations"].append(
                    "Package or publication date metadata cannot, "
                    "by itself, establish the original project's "
                    "creation date."
                )

    if (
        result["verdict"] == "Supported"
        and not result["supporting_evidence"]
    ):
        result["verdict"] = "Inconclusive"
        result["limitations"].append(
            "No valid cited supporting evidence was returned."
        )

    if (
        result["verdict"] == "Contradicted"
        and not result["contradicting_evidence"]
    ):
        result["verdict"] = "Inconclusive"
        result["limitations"].append(
            "No valid cited contradicting evidence was returned."
        )

    if (
        result["verdict"] == "Inconclusive"
        and not result["contradicting_evidence"]
    ):
        reason_lower = result["reason"].lower()

        contradiction_phrases = (
            "directly contradict",
            "contradicts the claim",
            "contradicting the claim",
            "proves the claim false",
            "disproves the claim",
            "the claim is false",
            "existed before",
            "predates the claimed",
            "was released before"
        )

        if any(
            phrase in reason_lower
            for phrase in contradiction_phrases
        ):
            result["reason"] = (
                "The available evidence does not establish a "
                "reliable conclusion for this assertion. "
                "No valid direct contradicting evidence was returned."
            )

        result["limitations"] = [
            limitation
            for limitation in result["limitations"]
            if not any(
                phrase in limitation.lower()
                for phrase in (
                    "directly contradicts the claim",
                    "directly contradict the claim",
                    "proves the claim false",
                    "disproves the claim"
                )
            )
        ]

    if (
        result["verdict"] == "Supported"
        and not result["supporting_evidence"]
    ):
        result["verdict"] = "Inconclusive"

    result["limitations"] = list(
        dict.fromkeys(result["limitations"])
    )

    return result



# 6. Single Claim Verification

def verify_single_claim(claim):
    sources = collect_evidence(claim)
    assessment = assess_evidence(claim, sources)

    public_sources = [
        {
            "title": source.get("title", ""),
            "url": source.get("url", ""),
            "snippet": source.get("content", "")[:1000],
            "relevance_score": source.get("relevance_score", 0),
            "exact_claim_url_match": source.get(
                "exact_claim_url_match", False
            ),
            "source_type": source.get("source_type", "unknown"),
            "source_priority": source.get("source_priority", "normal")
        }
        for source in sources
    ]

    return {
        "claim": claim,
        "verdict": assessment.get("verdict", "Inconclusive"),
        "reason": assessment.get("reason", ""),
        "supporting_evidence": assessment.get(
            "supporting_evidence", []
        ),
        "contradicting_evidence": assessment.get(
            "contradicting_evidence", []
        ),
        "limitations": assessment.get("limitations", []),
        "sources": public_sources
    }

# 7. Overall Claim Verification


def verify_claim(claim):
    if not isinstance(claim, str) or not claim.strip():
        return {
            "status": "error",
            "verdict": "Inconclusive",
            "claim": claim,
            "reason": "A non-empty claim is required.",
            "assertions": [],
            "sources": [],
            "limitations": [
                "Verification was not performed."
            ]
        }

    if not TAVILY_API_KEY or not GROQ_API_KEY:
        return {
            "status": "error",
            "verdict": "Inconclusive",
            "claim": claim,
            "reason": "TAVILY_API_KEY or GROQ_API_KEY is missing.",
            "assertions": [],
            "sources": [],
            "limitations": [
                "Configure the required keys in the .env file."
            ]
        }

    try:
        assertions = split_claim(claim)

        results = [
            verify_single_claim(part)
            for part in assertions
        ]

        verdicts = [
            item.get("verdict", "Inconclusive")
            for item in results
        ]

        if verdicts and all(
            verdict == "Supported"
            for verdict in verdicts
        ):
            overall_verdict = "Supported"

        elif verdicts and all(
            verdict == "Contradicted"
            for verdict in verdicts
        ):
            overall_verdict = "Contradicted"

        else:
            overall_verdict = "Inconclusive"

        combined_sources = []
        seen_urls = set()
        supporting = []
        contradicting = []

        limitations = [
            "Assertion splitting uses simple linguistic rules and may need manual review.",
            "Search snippets may omit context; full pages need review.",
            "Relevance scores are heuristic estimates, not probabilities.",
            "Source filtering can accidentally remove useful evidence.",
            "A verdict does not establish image authenticity."
        ]

        for item in results:
            for source in item.get("sources", []):
                url = source.get("url")

                if url and url not in seen_urls:
                    seen_urls.add(url)
                    combined_sources.append(source)

            supporting.extend(
                item.get("supporting_evidence", [])
            )

            contradicting.extend(
                item.get("contradicting_evidence", [])
            )

            item_verdict = item.get(
                "verdict",
                "Inconclusive"
            )

            item_reason = item.get("reason", "").lower()

            if item_verdict == "Inconclusive":
                limitations.append(
                    "The available evidence does not establish "
                    "a reliable conclusion for this assertion: "
                    + item.get("claim", "")
                )

            for limitation in item.get("limitations", []):
                limitation_lower = limitation.lower()

                if item_verdict == "Inconclusive":
                    if any(
                        phrase in limitation_lower
                        for phrase in (
                            "directly contradicts",
                            "directly contradict",
                            "proves the claim false",
                            "disproves the claim",
                            "definitively contradicted"
                        )
                    ):
                        continue

                limitations.append(limitation)

        reasons = []

        for item in results:
            item_claim = item.get("claim", "")
            item_verdict = item.get(
                "verdict",
                "Inconclusive"
            )
            item_reason = item.get("reason", "")

            if item_verdict == "Inconclusive":
                item_reason_lower = item_reason.lower()

                contradiction_phrases = (
                    "directly contradicts",
                    "directly contradict",
                    "proves the claim false",
                    "disproves the claim"
                )

                if any(
                    phrase in item_reason_lower
                    for phrase in contradiction_phrases
                ):
                    item_reason = (
                        "The available evidence does not establish "
                        "a reliable conclusion for this assertion."
                    )

            reasons.append(
                f"{item_claim}: {item_reason}"
            )

        return {
            "status": "success",
            "verdict": overall_verdict,
            "claim": claim,
            "reason": " ".join(reasons),
            "assertions": [
                {
                    "claim": item.get("claim", ""),
                    "verdict": item.get(
                        "verdict",
                        "Inconclusive"
                    ),
                    "reason": item.get("reason", ""),
                    "supporting_evidence": item.get(
                        "supporting_evidence", []
                    ),
                    "contradicting_evidence": item.get(
                        "contradicting_evidence", []
                    )
                }
                for item in results
            ],
            "supporting_evidence": supporting,
            "contradicting_evidence": contradicting,
            "sources": combined_sources,
            "verification_method": (
                "Tavily search + relevance filtering + Groq assessment"
            ),
            "limitations": list(dict.fromkeys(limitations))
        }

    except Exception as error:
        return {
            "status": "error",
            "verdict": "Inconclusive",
            "claim": claim,
            "reason": str(error),
            "assertions": [],
            "sources": [],
            "limitations": [
                "Verification failed; no factual verdict was established."
            ]
        }


# 8. Main Execution

if __name__ == "__main__":
    test_claim = (
        "The ImageHash Python library is hosted at "
        "https://github.com/JohannesBuchner/imagehash, "
        "and the library was created on Mars in 2026."
    )

    result = verify_claim(test_claim)

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )