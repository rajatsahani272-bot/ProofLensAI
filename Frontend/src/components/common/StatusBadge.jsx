
import { CheckCircle2, Clock3, AlertCircle, FlaskConical, CircleHelp } from "lucide-react";
import "./StatusBadge.css";

const statusConfig = {
  supported: {
    label: "Supported",
    icon: CheckCircle2,
    variant: "success"
  },
  processing: {
    label: "Processing",
    icon: Clock3,
    variant: "processing"
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    variant: "danger"
  },
  experimental: {
    label: "Experimental",
    icon: FlaskConical,
    variant: "warning"
  },
  unsupported: {
    label: "Unsupported",
    icon: AlertCircle,
    variant: "danger"
  },
  inconclusive: {
    label: "Inconclusive",
    icon: CircleHelp,
    variant: "neutral"
  }
};

const StatusBadge = ({ status, label, className = "" }) => {
  const key = String(status || "inconclusive").toLowerCase();
  const config = statusConfig[key] || statusConfig.inconclusive;
  const Icon = config.icon;

  return (
    <span
      className={`status-badge status-${config.variant} ${className}`.trim()}
      role="status"
    >
      <Icon size={14} aria-hidden="true" />
      <span>{label || config.label}</span>
    </span>
  );
};

export default StatusBadge;
