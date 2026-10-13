
import { useMemo } from "react";
import { AlertCircle, ArrowUpRight, RotateCcw, ShieldCheck } from "lucide-react";

import useVerification from "../hooks/useVerification.js";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import ImageUploader from "../components/upload/ImageUploader.jsx";
import ClaimInput from "../components/claims/ClaimInput.jsx";
import VerdictCard from "../components/analysis/VerdictCard.jsx";
import AIDetectionCard from "../components/analysis/AIDetectionCard.jsx";
import OCRResults from "../components/analysis/OCRResults.jsx";
import EvidenceList from "../components/analysis/EvidenceList.jsx";

import "./AnalyzePage.css";

const AnalyzePage = () => {
  const {
    file,
    previewUrl,
    claim,
    result,
    error,
    isAnalyzing,
    uploadProgress,
    selectFile,
    clearFile,
    updateClaim,
    analyze
  } = useVerification();

  const report = result?.report || {};

  const claimVerification = useMemo(
    () =>
      report.claim_verification ||
      report.stages?.claim_verification?.data ||
      {},
    [report]
  );

  const aiDetection = useMemo(
    () =>
      report.ai_detection ||
      report.stages?.ai_image_detection?.data ||
      {},
    [report]
  );

  const ocrAnalysis = useMemo(
    () =>
      report.ocr_analysis ||
      report.stages?.ocr_extraction?.data ||
      {},
    [report]
  );

  const evidence = claimVerification.supporting_evidence || [];
  const assertions = claimVerification.assertions || [];
  const limitations = report.limitations || [];

  const handleReset = () => {
    clearFile();
    updateClaim("");
  };

  return (
    <main className="analyze-page">
      <section className="analyze-page-intro">
        <div>
          <span className="analyze-page-eyebrow">
            <ShieldCheck size={15} />
            PROOFLENS AI / VERIFICATION LAB
          </span>

          <h1>Verify what you see.</h1>

          <p>
            Upload an image, provide a claim if you have one,
            and investigate the available evidence.
          </p>
        </div>

        <div className="analyze-page-tag">
          <span className="analyze-live-dot" />
          Analysis workspace
        </div>
      </section>

      <section className="analyze-workspace">
        <div className="analyze-main-column">
          <ImageUploader
            file={file}
            previewUrl={previewUrl}
            onFileSelect={selectFile}
            onClear={clearFile}
            onAnalyze={analyze}
            isAnalyzing={isAnalyzing}
            uploadProgress={uploadProgress}
          />

          <ClaimInput
            value={claim}
            onChange={updateClaim}
            disabled={isAnalyzing}
          />

          {error && (
            <div className="analyze-error" role="alert">
              <AlertCircle size={19} />

              <div>
                <strong>Analysis could not be completed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="analysis-results">
              <div className="analysis-results-heading">
                <div>
                  <span className="analyze-page-eyebrow">
                    ANALYSIS REPORT
                  </span>

                  <h2>Verification results</h2>

                  <p>
                    Review the verdict, model predictions and evidence.
                    These results do not independently prove authenticity.
                  </p>
                </div>

                <Button variant="secondary" onClick={handleReset}>
                  <RotateCcw size={16} />
                  New analysis
                </Button>
              </div>

              <VerdictCard
                claimVerification={claimVerification}
                summary={report.summary?.extracted_claim || ""}
              />

              <div className="analysis-results-grid">
                <AIDetectionCard detection={aiDetection} />

                <Card
                  title="Report details"
                  description="Reference information from the backend."
                >
                  <div className="report-detail-row">
                    <span>Verification ID</span>
                    <strong>
                      {result.verificationId || "Unavailable"}
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>File name</span>
                    <strong>{file?.name || "Unavailable"}</strong>
                  </div>

                  <div className="report-detail-row">
                    <span>Submitted claim</span>
                    <strong>{claim.trim() || "No claim provided"}</strong>
                  </div>

                  <div className="report-detail-note">
                    <ArrowUpRight size={15} />
                    <span>
                      Use the verification ID when referencing this report.
                    </span>
                  </div>
                </Card>
              </div>

              <OCRResults ocr={ocrAnalysis} />

              <EvidenceList
                evidence={evidence}
                assertions={assertions}
                limitations={limitations}
              />
            </div>
          )}
        </div>

        <aside className="analyze-sidebar">
          <Card
            title="How it works"
            description="A transparent verification workflow."
          >
            <ol className="analysis-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>Upload image</strong>
                  <p>Select a JPG, PNG or WebP file.</p>
                </div>
              </li>

              <li>
                <span>02</span>
                <div>
                  <strong>Describe the claim</strong>
                  <p>Optionally specify what you want to verify.</p>
                </div>
              </li>

              <li>
                <span>03</span>
                <div>
                  <strong>Review evidence</strong>
                  <p>Check sources and limitations before deciding.</p>
                </div>
              </li>
            </ol>
          </Card>

          <Card title="Responsible verification">
            <div className="responsible-note">
              <ShieldCheck size={20} />
              <p>
                Confirm important claims with primary sources or the
                institution that issued the document.
              </p>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
};

export default AnalyzePage;
