
import { ExternalLink, FileSearch, Info } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import "./EvidenceList.css";

const EvidenceList = ({
  evidence = [],
  assertions = [],
  limitations = []
}) => {
  const safeEvidence = Array.isArray(evidence) ? evidence : [];
  const safeAssertions = Array.isArray(assertions) ? assertions : [];
  const safeLimitations = Array.isArray(limitations) ? limitations : [];

  const items = [
    ...safeEvidence,
    ...safeAssertions.flatMap((assertion) =>
      Array.isArray(assertion.supporting_evidence)
        ? assertion.supporting_evidence
        : []
    )
  ].filter((item) => item && typeof item === "object");

  const uniqueItems = items.filter((item, index) => {
    const key = item.url || item.source_url || item.title || item.source || JSON.stringify(item);

    return items.findIndex((candidate) => {
      const candidateKey =
        candidate.url ||
        candidate.source_url ||
        candidate.title ||
        candidate.source ||
        JSON.stringify(candidate);

      return candidateKey === key;
    }) === index;
  });

  const getUrl = (item) => item.url || item.source_url || item.link || "";
  const getTitle = (item) =>
    item.title || item.source || item.name || "Evidence source";
  const getDescription = (item) =>
    item.description || item.snippet || item.reason || item.text || "";

  return (
    <section className="evidence-list">
      <div className="evidence-list-header">
        <div className="evidence-list-icon">
          <FileSearch size={21} />
        </div>

        <div>
          <h2>Supporting Evidence</h2>
          <p>{uniqueItems.length} evidence sources returned</p>
        </div>
      </div>

      {uniqueItems.length > 0 ? (
        <div className="evidence-items">
          {uniqueItems.map((item, index) => {
            const url = getUrl(item);
            const title = getTitle(item);
            const description = getDescription(item);
            const domain = (() => {
              try {
                return url ? new URL(url).hostname : "";
              } catch {
                return "";
              }
            })();

            return (
              <article className="evidence-item" key={`${title}-${index}`}>
                <div className="evidence-item-top">
                  <span className="evidence-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="evidence-item-content">
                    <h3>{title}</h3>

                    {domain && (
                      <span className="evidence-domain">{domain}</span>
                    )}
                  </div>

                  {url && /^https?:\/\//i.test(url) && (
                    <a
                      className="evidence-open-link"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open source: ${title}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                {description && (
                  <p className="evidence-description">{description}</p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="evidence-empty">
          <Info size={20} />
          <p>No supporting evidence sources were returned for this analysis.</p>
        </div>
      )}

      {safeLimitations.length > 0 && (
        <div className="evidence-limitations">
          <h3>Limitations</h3>

          <ul>
            {safeLimitations.map((limitation, index) => (
              <li key={index}>
                {typeof limitation === "string"
                  ? limitation
                  : limitation.message || limitation.description || JSON.stringify(limitation)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="evidence-footer">
        <StatusBadge status="inconclusive" label="Verify primary sources" />
        <p>
          Third-party sources provide context but do not independently prove
          that a document or claim is authentic.
        </p>
      </div>
    </section>
  );
};

export default EvidenceList;
