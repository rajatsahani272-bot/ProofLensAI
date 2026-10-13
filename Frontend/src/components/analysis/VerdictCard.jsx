
import {
  CheckCircle2,
  CircleHelp,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import "./VerdictCard.css";

const VerdictCard = ({ claimVerification = {}, summary = "" }) => {
  const verdict = String(
    claimVerification.verdict || "Inconclusive"
  ).toLowerCase();

  const isSupported = verdict === "supported";
  const isUnsupported = verdict === "unsupported";

  const variant = isSupported
    ? "supported"
    : isUnsupported
      ? "unsupported"
      : "inconclusive";

  const Icon = isSupported
    ? ShieldCheck
    : isUnsupported
      ? ShieldAlert
      : CircleHelp;

  const title = isSupported
    ? "Claim supported"
    : isUnsupported
      ? "Claim not supported"
      : "Inconclusive result";

  const reason =
    claimVerification.reason ||
    claimVerification.explanation ||
    summary ||
    "There is not enough information to determine whether this claim is accurate.";

  return (
    <section className={`verdict-card verdict-${variant}`}>
      <div className="verdict-card-top">
        <div className="verdict-icon">
          <Icon size={25} />
        </div>

        <StatusBadge
          status={isSupported ? "supported" : isUnsupported ? "unsupported" : "inconclusive"}
          label={isSupported ? "Supported" : isUnsupported ? "Unsupported" : "Inconclusive"}
        />
      </div>

      <div className="verdict-card-content">
        <span className="verdict-eyebrow">CLAIM VERIFICATION</span>
        <h2>{title}</h2>
        <p>{reason}</p>
      </div>

      <div className="verdict-disclaimer">
        <CheckCircle2 size={15} />
        <span>
          This verdict reflects the available evidence, not a guarantee of authenticity.
        </span>
      </div>
    </section>
  );
};

export default VerdictCard;
