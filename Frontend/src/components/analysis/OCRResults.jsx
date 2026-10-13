
import { useMemo, useState } from "react";
import { Copy, FileText, Search } from "lucide-react";
import "./OCRResults.css";

const OCRResults = ({ ocr = {} }) => {
  const [search, setSearch] = useState("");

  const extractedText =
    ocr.extracted_text ??
    ocr.text ??
    ocr.full_text ??
    "";

  const entries = useMemo(() => {
    if (Array.isArray(extractedText)) {
      return extractedText.map((item, index) => {
        if (typeof item === "string") {
          return {
            id: index,
            text: item,
            confidence: null
          };
        }

        return {
          id: index,
          text: item.text ?? item.value ?? "",
          confidence: Number.isFinite(Number(item.confidence))
            ? Number(item.confidence)
            : null
        };
      });
    }

    if (typeof extractedText === "string" && extractedText.trim()) {
      return extractedText
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line, index) => ({
          id: index,
          text: line,
          confidence: null
        }));
    }

    return [];
  }, [extractedText]);

  const filteredEntries = entries.filter((entry) =>
    entry.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async () => {
    const text = entries.map((entry) => entry.text).join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy the extracted text:", text);
    }
  };

  return (
    <section className="ocr-results">
      <div className="ocr-results-header">
        <div className="ocr-results-title">
          <div className="ocr-results-icon">
            <FileText size={21} />
          </div>

          <div>
            <h2>Extracted Text</h2>
            <p>{entries.length} text entries detected</p>
          </div>
        </div>

        <button
          type="button"
          className="ocr-copy-button"
          onClick={handleCopy}
          disabled={entries.length === 0}
        >
          <Copy size={15} />
          Copy text
        </button>
      </div>

      <label className="ocr-search">
        <Search size={17} />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search extracted text..."
        />
      </label>

      <div className="ocr-results-list">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div className="ocr-result-entry" key={entry.id}>
              <p>{entry.text}</p>

              {entry.confidence !== null && (
                <span className="ocr-confidence">
                  Confidence:{" "}
                  {(entry.confidence <= 1
                    ? entry.confidence * 100
                    : entry.confidence
                  ).toFixed(1)}%
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="ocr-empty">
            {entries.length === 0
              ? "No extracted text is available."
              : "No text matches your search."}
          </div>
        )}
      </div>

      <p className="ocr-disclaimer">
        OCR may misread characters, names, dates, or numbers. Verify important
        details against the original image.
      </p>
    </section>
  );
};

export default OCRResults;
