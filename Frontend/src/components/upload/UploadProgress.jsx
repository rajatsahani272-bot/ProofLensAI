
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ScanSearch
} from "lucide-react";
import "./UploadProgress.css";

const UploadProgress = ({
  progress = 0,
  isUploading = false,
  isAnalyzing = false,
  message
}) => {
  if (!isUploading && !isAnalyzing) {
    return null;
  }

  const normalizedProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const uploadComplete = normalizedProgress >= 100;

  const title = message || (
    isUploading && !uploadComplete
      ? "Uploading image"
      : "Analyzing image"
  );

  return (
    <section className="upload-progress-card" aria-live="polite">
      <div className="upload-progress-icon">
        {isUploading && !uploadComplete ? (
          <LoaderCircle
            className="upload-progress-spinner"
            size={21}
          />
        ) : uploadComplete && !isAnalyzing ? (
          <CheckCircle2 size={21} />
        ) : (
          <ScanSearch size={21} />
        )}
      </div>

      <div className="upload-progress-body">
        <div className="upload-progress-heading">
          <strong>{title}</strong>

          {isUploading && !uploadComplete && (
            <span>{normalizedProgress}%</span>
          )}
        </div>

        <p>
          {isUploading && !uploadComplete
            ? "Sending your image to the verification service."
            : "AI analysis is running. This may take a minute or longer."}
        </p>

        {isUploading && !uploadComplete && (
          <div
            className="upload-progress-track"
            role="progressbar"
            aria-label="Image upload progress"
            aria-valuenow={normalizedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                width: `${normalizedProgress}%`
              }}
            />
          </div>
        )}

        {isAnalyzing && (
          <div className="analysis-running-label">
            <Clock3 size={14} />
            <span>Processing image and extracting evidence</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadProgress;
