
import { Clock3, LoaderCircle, ScanSearch } from "lucide-react";
import "./AnalysisProgress.css";

const AnalysisProgress = ({
  isAnalyzing = false,
  message = "Analyzing image",
  stage = "Processing image and extracting evidence"
}) => {
  if (!isAnalyzing) return null;

  return (
    <section className="analysis-progress" aria-live="polite">
      <div className="analysis-progress-icon">
        <LoaderCircle size={23} className="analysis-progress-spinner" />
      </div>

      <div className="analysis-progress-content">
        <div className="analysis-progress-title">
          <ScanSearch size={17} />
          <h3>{message}</h3>
        </div>

        <p>{stage}</p>

        <div className="analysis-progress-track">
          <div className="analysis-progress-indicator" />
        </div>

        <div className="analysis-progress-footer">
          <Clock3 size={14} />
          <span>Processing may take a minute or longer</span>
        </div>
      </div>
    </section>
  );
};

export default AnalysisProgress;
