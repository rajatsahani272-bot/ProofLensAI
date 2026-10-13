
import { FileSearch, Info } from "lucide-react";
import "./ClaimInput.css";

const ClaimInput = ({
  value = "",
  onChange,
  disabled = false,
  maxLength = 1000
}) => {
  return (
    <section className="claim-input-card">
      <div className="claim-input-heading">
        <div className="claim-input-icon">
          <FileSearch size={21} />
        </div>

        <div>
          <h2>What do you want to verify?</h2>
          <p>
            Enter the statement you want ProofLens AI to investigate.
          </p>
        </div>
      </div>

      <label className="claim-input-label" htmlFor="verification-claim">
        Verification claim
        <span>Optional</span>
      </label>

      <textarea
        id="verification-claim"
        className="claim-input-textarea"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Example: This certificate was issued by AKTU..."
        maxLength={maxLength}
        rows={4}
        disabled={disabled}
      />

      <div className="claim-input-footer">
        <div className="claim-input-hint">
          <Info size={15} />
          <span>
            Specific claims help focus the verification process.
          </span>
        </div>

        <span className="claim-input-counter">
          {value.length}/{maxLength}
        </span>
      </div>
    </section>
  );
};

export default ClaimInput;
