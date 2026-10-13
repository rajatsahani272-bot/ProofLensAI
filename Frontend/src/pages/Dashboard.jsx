
import {
  ArrowRight,
  BrainCircuit,
  FileCheck2,
  History,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload
} from "lucide-react";

import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import "./Dashboard.css";

const Dashboard = ({ onNavigate }) => {
  const handleAnalyze = () => {
    onNavigate?.("analyze");
  };

  const handleHistory = () => {
    onNavigate?.("history");
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <span className="dashboard-eyebrow">
            <Sparkles size={15} />
            PROOFLENS AI WORKSPACE
          </span>

          <h1>See beyond the image.</h1>

          <p>
            Investigate image authenticity, extract document text, and
            evaluate claims with evidence-backed analysis.
          </p>

          <div className="dashboard-welcome-actions">
            <Button onClick={handleAnalyze}>
              <ScanSearch size={17} />
              Start verification
              <ArrowRight size={16} />
            </Button>

            <Button variant="secondary" onClick={handleHistory}>
              <History size={16} />
              View history
            </Button>
          </div>
        </div>

        <div className="dashboard-hero-art" aria-hidden="true">
          <div className="dashboard-orbit dashboard-orbit-one" />
          <div className="dashboard-orbit dashboard-orbit-two" />

          <div className="dashboard-hero-icon">
            <ShieldCheck size={65} strokeWidth={1.3} />
          </div>

          <div className="dashboard-floating-icon dashboard-floating-top">
            <BrainCircuit size={21} />
          </div>

          <div className="dashboard-floating-icon dashboard-floating-bottom">
            <FileCheck2 size={21} />
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Workspace overview</h2>
            <p>Tools available in your verification workspace.</p>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <Card>
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon stat-purple">
                <ScanSearch size={21} />
              </div>

              <span className="dashboard-stat-label">
                Verification tools
              </span>

              <strong>3</strong>

              <p>OCR, AI detection and claim analysis</p>
            </div>
          </Card>

          <Card>
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon stat-blue">
                <BrainCircuit size={21} />
              </div>

              <span className="dashboard-stat-label">
                AI detection
              </span>

              <strong>Available</strong>

              <p>Experimental model predictions</p>
            </div>
          </Card>

          <Card>
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon stat-green">
                <FileCheck2 size={21} />
              </div>

              <span className="dashboard-stat-label">
                Claim verification
              </span>

              <strong>Available</strong>

              <p>Review claims and supporting evidence</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <Card
          title="Start a verification"
          description="Follow these steps to investigate an image."
        >
          <div className="dashboard-quick-steps">
            <div className="dashboard-quick-step">
              <span className="dashboard-step-number">01</span>
              <div>
                <h3>Upload an image</h3>
                <p>Choose a JPG, PNG, or WebP image up to 10 MB.</p>
              </div>
            </div>

            <div className="dashboard-quick-step">
              <span className="dashboard-step-number">02</span>
              <div>
                <h3>Run the analysis</h3>
                <p>Inspect extracted text, model predictions and claims.</p>
              </div>
            </div>

            <div className="dashboard-quick-step">
              <span className="dashboard-step-number">03</span>
              <div>
                <h3>Review the evidence</h3>
                <p>Check sources and limitations before drawing conclusions.</p>
              </div>
            </div>
          </div>

          <Button block onClick={handleAnalyze}>
            <Upload size={16} />
            Upload image to begin
          </Button>
        </Card>

        <Card
          title="System capabilities"
          description="Features configured in the workspace."
        >
          <div className="dashboard-capability-list">
            <div className="dashboard-capability">
              <div className="dashboard-capability-icon">
                <FileCheck2 size={18} />
              </div>

              <div>
                <h3>Text extraction</h3>
                <p>OCR analysis of visible image text.</p>
              </div>

              <StatusBadge status="supported" label="Module" />
            </div>

            <div className="dashboard-capability">
              <div className="dashboard-capability-icon">
                <BrainCircuit size={18} />
              </div>

              <div>
                <h3>AI image detection</h3>
                <p>Model-generated prediction scores.</p>
              </div>

              <StatusBadge status="experimental" />
            </div>

            <div className="dashboard-capability">
              <div className="dashboard-capability-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h3>Claim analysis</h3>
                <p>Evidence-based claim assessment.</p>
              </div>

              <StatusBadge status="inconclusive" label="Evidence-dependent" />
            </div>
          </div>
        </Card>
      </section>

      <section className="dashboard-notice">
        <ShieldCheck size={19} />

        <div>
          <strong>Accuracy and transparency matter</strong>
          <p>
            An AI score or a supported claim does not prove that an image
            or document is authentic. Check the original issuer and primary
            sources whenever possible.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
