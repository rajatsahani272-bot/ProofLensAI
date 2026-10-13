
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  CircleHelp,
  Search
} from "lucide-react";

import "./FAQSection.css";

const faqs = [
  {
    id: "upload",
    category: "Getting Started",
    question: "Which image formats are supported?",
    answer:
      "The upload interface accepts JPG, PNG and WebP images. The current upload limit is 10 MB per image."
  },
  {
    id: "claim",
    category: "Getting Started",
    question: "Do I need to enter a verification claim?",
    answer:
      "No. The claim field is optional. A specific claim can help define what you want to investigate, provided the verification pipeline uses that claim."
  },
  {
    id: "ai-score",
    category: "Image Verification",
    question: "Does the AI detection score prove an image is fake?",
    answer:
      "No. AI-image detection is probabilistic and may produce false positives or false negatives. Treat the score as an experimental signal, not a final authenticity verdict."
  },
  {
    id: "ocr",
    category: "Image Verification",
    question: "What does OCR do?",
    answer:
      "Optical Character Recognition extracts readable text from an image. OCR output can contain mistakes and does not establish whether a certificate, screenshot or document is genuine."
  },
  {
    id: "verdict",
    category: "Image Verification",
    question: "What do Supported, Unsupported and Inconclusive mean?",
    answer:
      "These labels describe how the available evidence relates to the investigated claim. They do not automatically authenticate the complete image or document. Read the report's evidence and limitations."
  },
  {
    id: "sources",
    category: "Image Verification",
    question: "Why are some evidence sources third-party websites?",
    answer:
      "Public search results may include third-party sources. Check the actual source URL and prefer primary sources, official records or confirmation from the issuing institution."
  },
  {
    id: "slow",
    category: "Troubleshooting",
    question: "Why is image analysis taking a long time?",
    answer:
      "Analysis may involve OCR, image detection and evidence research. If the request times out, check that the backend and AI service are running, then retry. The exact duration depends on the pipeline."
  },
  {
    id: "failed",
    category: "Troubleshooting",
    question: "What should I do if analysis fails?",
    answer:
      "Confirm the image format and size, check your connection, and retry. If the problem persists, record the error message and verification ID if one was returned."
  },
  {
    id: "privacy",
    category: "Privacy & Safety",
    question: "Should I upload sensitive documents?",
    answer:
      "Avoid uploading documents containing unnecessary personal, financial or confidential information. Review the application's privacy policy and data-handling practices before uploading sensitive material."
  },
  {
    id: "primary",
    category: "Privacy & Safety",
    question: "How can I verify an important claim?",
    answer:
      "Use the report as a starting point. Confirm important claims through official websites, original records or direct contact with the relevant institution."
  }
];

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState("ai-score");

  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail || "");
    };

    window.addEventListener(
      "prooflens-faq-search",
      handleSearch
    );

    return () => {
      window.removeEventListener(
        "prooflens-faq-search",
        handleSearch
      );
    };
  }, []);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return faqs;

    return faqs.filter((faq) =>
      `${faq.question} ${faq.answer} ${faq.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  const groupedFaqs = useMemo(() => {
    return filteredFaqs.reduce((groups, faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }

      groups[faq.category].push(faq);
      return groups;
    }, {});
  }, [filteredFaqs]);

  return (
    <section
      className="help-faq-section"
      id="faq-section"
    >
      <div className="help-section-heading">
        <div>
          <span className="help-section-label">
            <CircleHelp size={14} />
            KNOWLEDGE BASE
          </span>
          <h2>Frequently asked questions</h2>
        </div>

        <p>Find answers to common questions.</p>
      </div>

      <div className="faq-search">
        <Search size={17} />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Filter frequently asked questions..."
          aria-label="Filter frequently asked questions"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </button>
        )}
      </div>

      {Object.entries(groupedFaqs).map(
        ([category, items]) => (
          <div className="faq-category" key={category}>
            <h3>{category}</h3>

            <div className="faq-list">
              {items.map((faq) => {
                const isOpen = activeId === faq.id;

                return (
                  <article
                    className={`faq-item ${isOpen ? "is-open" : ""}`}
                    key={faq.id}
                  >
                    <button
                      className="faq-question"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      onClick={() =>
                        setActiveId(isOpen ? "" : faq.id)
                      }
                    >
                      <span>{faq.question}</span>

                      <ChevronDown
                        size={19}
                        className="faq-chevron"
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="faq-answer"
                        id={`faq-answer-${faq.id}`}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )
      )}

      {filteredFaqs.length === 0 && (
        <div className="faq-empty">
          <CircleHelp size={25} />
          <h3>No matching questions</h3>
          <p>
            Try another keyword or contact support below.
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
          >
            Show all FAQs
          </button>
        </div>
      )}
    </section>
  );
};

export default FAQSection;
