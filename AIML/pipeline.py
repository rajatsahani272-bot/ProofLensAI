
from pathlib import Path
from datetime import datetime, timezone
import json

from image_processing import analyze_image
from ocr_engine import extract_text
from ai_detector import detect_ai_image
from groq_analyzer import analyze_with_groq
from claim_verifier import verify_claim


BASE_DIR = Path(__file__).resolve().parent

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff"
}


def utc_timestamp():
    return datetime.now(timezone.utc).isoformat()


def make_stage(status="not_run", message=None, data=None):
    result = {
        "status": status,
        "started_at": None,
        "completed_at": None,
        "duration_ms": None,
        "message": message,
        "error": None,
        "data": data
    }

    return result


def execute_stage(stages, stage_name, function, *args):
    stage = stages[stage_name]
    stage["status"] = "running"
    stage["started_at"] = utc_timestamp()

    start_time = datetime.now(timezone.utc)

    try:
        result = function(*args)

        stage["status"] = "success"
        stage["data"] = result

        return result

    except Exception as error:
        stage["status"] = "error"
        stage["error"] = {
            "type": type(error).__name__,
            "message": str(error)
        }

        return None

    finally:
        end_time = datetime.now(timezone.utc)

        stage["completed_at"] = end_time.isoformat()
        stage["duration_ms"] = round(
            (end_time - start_time).total_seconds() * 1000,
            2
        )


def validate_image_path(image_path):
    path = Path(image_path).expanduser()

    if not path.is_absolute():
        path = BASE_DIR / path

    path = path.resolve()

    if not path.exists():
        raise FileNotFoundError(
            f"Image not found: {path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Path is not a file: {path}"
        )

    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported image extension: {path.suffix}"
        )

    if path.stat().st_size == 0:
        raise ValueError("Image file is empty.")

    return path


def validate_ocr_result(ocr_data):
    if not isinstance(ocr_data, dict):
        raise ValueError(
            "OCR engine must return a dictionary."
        )

    extracted = ocr_data.get("extracted_text")

    if not isinstance(extracted, list):
        raise ValueError(
            "OCR result must contain an extracted_text list."
        )

    normalized = []

    for item in extracted:
        if not isinstance(item, dict):
            continue

        text = item.get("text")

        if isinstance(text, str) and text.strip():
            normalized.append({
                **item,
                "text": text.strip()
            })

    return ocr_data, normalized


def validate_ai_result(ai_result):
    if not isinstance(ai_result, dict):
        raise ValueError(
            "Groq analysis must return a dictionary."
        )

    analysis = ai_result.get("analysis")

    if not isinstance(analysis, dict):
        raise ValueError(
            "Groq analysis must contain an analysis dictionary."
        )

    return ai_result, analysis


def normalize_verification_result(result):
    if not isinstance(result, dict):
        return {
            "status": "error",
            "verdict": "Inconclusive",
            "reason": "Claim verifier returned an invalid response.",
            "sources": [],
            "supporting_evidence": [],
            "contradicting_evidence": [],
            "limitations": [
                "The claim verification response was invalid."
            ]
        }

    result.setdefault("status", "unknown")
    result.setdefault("verdict", "Inconclusive")
    result.setdefault("reason", "")
    result.setdefault("sources", [])
    result.setdefault("supporting_evidence", [])
    result.setdefault("contradicting_evidence", [])
    result.setdefault("limitations", [])

    if not isinstance(result["sources"], list):
        result["sources"] = []

    if not isinstance(result["supporting_evidence"], list):
        result["supporting_evidence"] = []

    if not isinstance(result["contradicting_evidence"], list):
        result["contradicting_evidence"] = []

    if not isinstance(result["limitations"], list):
        result["limitations"] = []

    return result


def analyze_image_pipeline(image_path):
    pipeline_started = utc_timestamp()
    start_time = datetime.now(timezone.utc)

    stages = {
        "input_validation": make_stage(),
        "image_analysis": make_stage(),
        "ocr_extraction": make_stage(),
        "ai_image_detection": make_stage(),
        "groq_analysis": make_stage(),
        "claim_verification": make_stage()
    }

    report = {
        "schema_version": "1.0",
        "pipeline": {
            "name": "ProofLens AI",
            "started_at": pipeline_started,
            "completed_at": None,
            "duration_ms": None,
            "status": "running"
        },
        "input": {
            "filename": None,
            "path": None,
            "extension": None,
            "size_bytes": None
        },
        "stages": stages,
        "image_analysis": None,
        "ocr_analysis": None,
        "ai_detection": None,
        "ai_analysis": {
            "provider": "Groq",
            "status": "not_run",
            "analysis": None
        },
        "claim_verification": {
            "status": "not_run",
            "verdict": "Inconclusive",
            "reason": "Claim verification has not been performed.",
            "sources": [],
            "supporting_evidence": [],
            "contradicting_evidence": [],
            "limitations": []
        },
        "summary": {
            "extracted_text": "",
            "has_readable_text": False,
            "has_verifiable_claim": False,
            "extracted_claim": None,
            "verification_verdict": "Inconclusive"
        },
        "errors": [],
        "limitations": [
            "AI image detection is experimental and may produce false positives or false negatives.",
            "OCR errors can affect downstream claim extraction.",
            "OCR confidence does not establish whether a claim is true.",
            "Perceptual hash similarity alone does not prove image authenticity.",
            "Groq analysis alone does not establish factual accuracy.",
            "Claim verification depends on the quality, relevance and completeness of external evidence.",
            "A factual claim verdict does not establish whether an image itself is authentic."
        ]
    }

    def add_error(stage_name, error):
        stages[stage_name]["error"] = {
            "type": type(error).__name__,
            "message": str(error)
        }

        report["errors"].append({
            "stage": stage_name,
            "type": type(error).__name__,
            "message": str(error)
        })

    def finish_report():
        end_time = datetime.now(timezone.utc)

        report["pipeline"]["completed_at"] = end_time.isoformat()
        report["pipeline"]["duration_ms"] = round(
            (end_time - start_time).total_seconds() * 1000,
            2
        )

        statuses = [
            stage["status"]
            for stage in stages.values()
        ]

        successful = statuses.count("success")
        failed = statuses.count("error")

        if failed and successful:
            overall_status = "partial_failure"
        elif failed:
            overall_status = "error"
        elif successful:
            overall_status = "success"
        else:
            overall_status = "error"

        report["pipeline"]["status"] = overall_status

        report["summary"]["verification_verdict"] = (
            report["claim_verification"].get(
                "verdict",
                "Inconclusive"
            )
        )

        report["summary"]["has_verifiable_claim"] = (
            report["claim_verification"].get("status")
            not in ("not_run", "no_claim", "skipped", "error", "parse_error")
        )

        report["errors"] = list(report["errors"])

        return report

    try:
        image_path = execute_stage(
            stages,
            "input_validation",
            validate_image_path,
            image_path
        )

        if image_path is None:
            error_data = stages["input_validation"]["error"]

            report["errors"].append({
                "stage": "input_validation",
                **error_data
            })

            return finish_report()

        stages["input_validation"]["data"] = {
            "valid": True,
            "absolute_path": str(image_path),
            "extension": image_path.suffix.lower(),
            "size_bytes": image_path.stat().st_size
        }

        report["input"].update({
            "filename": image_path.name,
            "path": str(image_path),
            "extension": image_path.suffix.lower(),
            "size_bytes": image_path.stat().st_size
        })

        image_data = execute_stage(
            stages,
            "image_analysis",
            analyze_image,
            str(image_path)
        )

        report["image_analysis"] = image_data

        ocr_result = execute_stage(
            stages,
            "ocr_extraction",
            extract_text,
            str(image_path)
        )

        extracted_items = []

        if ocr_result is not None:
            try:
                ocr_data, extracted_items = validate_ocr_result(
                    ocr_result
                )

                report["ocr_analysis"] = ocr_data
                stages["ocr_extraction"]["data"] = ocr_data

            except Exception as error:
                stages["ocr_extraction"]["status"] = "error"
                add_error("ocr_extraction", error)

        if stages["ocr_extraction"]["status"] == "error":
            report["ocr_analysis"] = {
                "status": "error",
                "extracted_text": []
            }

        extracted_text = "\n".join(
            item["text"]
            for item in extracted_items
        )

        report["summary"].update({
            "extracted_text": extracted_text,
            "has_readable_text": bool(extracted_text.strip())
        })

        ai_data = execute_stage(
            stages,
            "ai_image_detection",
            detect_ai_image,
            str(image_path)
        )

        report["ai_detection"] = ai_data

        if not extracted_text.strip():
            stages["groq_analysis"]["status"] = "skipped"
            stages["groq_analysis"]["message"] = (
                "No readable text was extracted from the image."
            )

            stages["claim_verification"]["status"] = "skipped"
            stages["claim_verification"]["message"] = (
                "Claim verification requires an extracted factual claim."
            )

            report["ai_analysis"].update({
                "status": "skipped",
                "analysis": (
                    "No readable text was extracted from the image."
                )
            })

            report["claim_verification"] = {
                "status": "no_claim",
                "verdict": "Inconclusive",
                "reason": (
                    "No readable text was available to identify a claim."
                ),
                "sources": [],
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [
                    "The image may contain no text, or OCR may have failed to recognize it."
                ]
            }

            return finish_report()

        analysis_input = {
            "extracted_text": extracted_text,
            "image_metadata": image_data,
            "experimental_ai_detection": ai_data
        }

        ai_result = execute_stage(
            stages,
            "groq_analysis",
            analyze_with_groq,
            json.dumps(
                analysis_input,
                ensure_ascii=False,
                default=str
            )
        )

        if ai_result is None:
            report["ai_analysis"]["status"] = "error"

            error_data = stages["groq_analysis"]["error"]

            add_error(
                "groq_analysis",
                Exception(error_data["message"])
            )

            stages["claim_verification"]["status"] = "skipped"
            stages["claim_verification"]["message"] = (
                "Groq analysis failed; claim extraction was unavailable."
            )

            report["claim_verification"] = {
                "status": "skipped",
                "verdict": "Inconclusive",
                "reason": "Groq analysis failed; verification was skipped.",
                "sources": [],
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [
                    "Claim verification could not run because claim extraction failed."
                ]
            }

            return finish_report()

        try:
            ai_result, analysis = validate_ai_result(ai_result)

            report["ai_analysis"].update({
                **ai_result,
                "provider": "Groq",
                "status": "success"
            })

            report["ai_analysis"]["analysis"] = analysis
            stages["groq_analysis"]["data"] = ai_result

        except Exception as error:
            stages["groq_analysis"]["status"] = "error"
            add_error("groq_analysis", error)

            report["ai_analysis"].update({
                "status": "parse_error",
                "message": str(error)
            })

            stages["claim_verification"]["status"] = "skipped"
            stages["claim_verification"]["message"] = (
                "Groq returned an invalid analysis structure."
            )

            report["claim_verification"] = {
                "status": "parse_error",
                "verdict": "Inconclusive",
                "reason": (
                    "Groq did not return a valid structured analysis."
                ),
                "sources": [],
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [
                    "The model response did not match the expected schema."
                ]
            }

            return finish_report()

        claim = str(
            analysis.get("main_claim", "")
        ).strip()

        has_claim = (
            analysis.get("has_verifiable_claim") is True
            and bool(claim)
        )

        if not has_claim:
            stages["claim_verification"]["status"] = "skipped"
            stages["claim_verification"]["message"] = (
                "No verifiable factual claim was identified."
            )

            report["claim_verification"] = {
                "status": "no_claim",
                "verdict": "Inconclusive",
                "reason": analysis.get(
                    "reason",
                    "No identifiable factual claim was extracted."
                ),
                "sources": [],
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [
                    "No verifiable factual claim was extracted from the image."
                ]
            }

            return finish_report()

        report["summary"]["extracted_claim"] = claim
        report["ai_analysis"]["extracted_claim"] = claim

        verification_result = execute_stage(
            stages,
            "claim_verification",
            verify_claim,
            claim
        )

        if verification_result is None:
            report["claim_verification"] = {
                "status": "error",
                "verdict": "Inconclusive",
                "reason": "Claim verification failed.",
                "sources": [],
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [
                    "No reliable factual verdict was established."
                ]
            }

            error_data = stages["claim_verification"]["error"]

            report["errors"].append({
                "stage": "claim_verification",
                **error_data
            })

        else:
            verification_result = normalize_verification_result(
                verification_result
            )

            report["claim_verification"] = verification_result
            stages["claim_verification"]["data"] = {
                "status": verification_result["status"],
                "verdict": verification_result["verdict"],
                "reason": verification_result["reason"],
                "source_count": len(
                    verification_result["sources"]
                )
            }

            if verification_result["status"] == "error":
                report["errors"].append({
                    "stage": "claim_verification",
                    "type": "VerificationError",
                    "message": verification_result["reason"]
                })

        return finish_report()

    except Exception as error:
        report["errors"].append({
            "stage": "pipeline",
            "type": type(error).__name__,
            "message": str(error)
        })

        return finish_report()


if __name__ == "__main__":
    result = analyze_image_pipeline("images/imagehash.png")

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False,
            default=str
        )
    )
