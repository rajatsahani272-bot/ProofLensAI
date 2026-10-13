
import { BrainCircuit, Info } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import "./AIDetectionCard.css";

const formatPercent = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  const normalized = number >= 0 && number <= 1
    ? number * 100
    : number;

  return Math.min(100, Math.max(0, normalized));
};

const AIDetectionCard = ({ detection = {} }) => {
  const predictions = Array.isArray(detection.predictions)
    ? detection.predictions
    : [];

  const findScore = (terms) => {
    const prediction = predictions.find((item) =>
      terms.some((term) =>
        String(item.label || item.class || "")
          .toLowerCase()
          .includes(term)
      )
    );

    return prediction
      ? formatPercent(prediction.score ?? prediction.confidence)
      : null;
  };

  const aiScore = findScore(["ai", "artificial", "synthetic", "fake"]);
  const humanScore = findScore(["human", "real", "authentic", "natural"]);

  const warning =
    detection.warning ||
    detection.message ||
    "AI-image detection is experimental and can produce false positives and false negatives.";

  return (
    <section className="ai-detection-card">
      <div className="ai-detection-header">
        <div className="ai-detection-title-icon">
          <BrainCircuit size={22} />
        </div>

        <div className="ai-detection-heading">
          <h2>AI Image Detection</h2>
          <p>Model prediction scores</p>
        </div>

        <StatusBadge status="experimental" />
      </div>

      <div className="ai-detection-scores">
        <div className="ai-score-row">
          <div className="ai-score-label">
            <span>AI-generated</span>
            <strong>
              {aiScore === null ? "N/A" : `${aiScore.toFixed(1)}%`}
            </strong>
          </div>

          <div className="ai-score-track">
            <div
              className="ai-score-fill ai-score-fill-ai"
              style={{ width: `${aiScore ?? 0}%` }}
            />
          </div>
        </div>

        <div className="ai-score-row">
          <div className="ai-score-label">
            <span>Human-generated</span>
            <strong>
              {humanScore === null ? "N/A" : `${humanScore.toFixed(1)}%`}
            </strong>
          </div>

          <div className="ai-score-track">
            <div
              className="ai-score-fill ai-score-fill-human"
              style={{ width: `${humanScore ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {predictions.length === 0 && (
        <p className="ai-score-unavailable">
          The model did not return readable prediction scores.
        </p>
      )}

      <div className="ai-detection-warning">
        <Info size={17} />
        <p>{warning}</p>
      </div>
    </section>
  );
};

export default AIDetectionCard;
