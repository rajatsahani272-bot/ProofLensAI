import unittest
from unittest.mock import patch

import claim_verifier as cv


class TestClaimSplitting(unittest.TestCase):

    def test_url_trailing_comma(self):
        claim = (
            "The ImageHash Python library is hosted at "
            "https://github.com/JohannesBuchner/imagehash, "
            "and the library was created on Mars in 2026."
        )

        parts = cv.split_claim(claim)

        self.assertEqual(len(parts), 2)
        self.assertFalse(parts[0].endswith(","))
        self.assertIn("ImageHash Python library", parts[1])
        self.assertIn("Mars in 2026", parts[1])


class TestSourceFiltering(unittest.TestCase):

    def test_irrelevant_source_is_filtered(self):
        claim = "The ImageHash Python library was created on Mars in 2026."

        sources = [
            {
                "title": "Mars Area Public Library 2026",
                "url": "https://example.org/mars-library",
                "content": "The public library reopened in 2026.",
                "relevance_score": 0.5,
                "exact_claim_url_match": False,
                "source_type": "third_party",
                "source_priority": "normal"
            },
            {
                "title": "ImageHash Python package",
                "url": "https://example.org/imagehash",
                "content": "ImageHash is a Python perceptual hashing library.",
                "relevance_score": 0.4,
                "exact_claim_url_match": False,
                "source_type": "third_party",
                "source_priority": "normal"
            }
        ]

        filtered = cv.filter_relevant_sources(claim, sources)

        self.assertNotIn(
            "https://example.org/mars-library",
            [source["url"] for source in filtered]
        )


class TestVerdictAggregation(unittest.TestCase):

    def run_mocked_claim(self, claim, verdicts):
        assertions = cv.split_claim(claim)

        fake_results = [
            {
                "claim": assertion,
                "verdict": verdict,
                "reason": "Mocked test result.",
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "limitations": [],
                "sources": []
            }
            for assertion, verdict in zip(assertions, verdicts)
        ]

        with patch.object(
            cv,
            "verify_single_claim",
            side_effect=fake_results
        ):
            return cv.verify_claim(claim)

    def test_supported_claim(self):
        result = self.run_mocked_claim(
            "ImageHash is a Python library.",
            ["Supported"]
        )

        self.assertEqual(result["verdict"], "Supported")

    def test_contradicted_claim(self):
        result = self.run_mocked_claim(
            "ImageHash is a Python library.",
            ["Contradicted"]
        )

        self.assertEqual(result["verdict"], "Contradicted")

    def test_inconclusive_claim(self):
        result = self.run_mocked_claim(
            "ImageHash was created on Mars in 2026.",
            ["Inconclusive"]
        )

        self.assertEqual(result["verdict"], "Inconclusive")

    def test_mixed_claim_does_not_become_supported(self):
        claim = (
            "ImageHash is a Python library; "
            "ImageHash was created on Mars in 2026."
        )

        result = self.run_mocked_claim(
            claim,
            ["Supported", "Inconclusive"]
        )

        self.assertEqual(result["verdict"], "Inconclusive")
        self.assertEqual(len(result["assertions"]), 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)