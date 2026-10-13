
import { useRef, useState } from "react";
import { Upload, ScanSearch, FileCheck2 } from "lucide-react";
import Button from "../common/Button.jsx";
import ImagePreview from "./ImagePreview.jsx";
import UploadProgress from "./UploadProgress.jsx";
import "./ImageUploader.css";

const ImageUploader = ({
  file,
  previewUrl,
  onFileSelect,
  onClear,
  onAnalyze,
  isAnalyzing = false,
  uploadProgress = 0
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    if (isAnalyzing) return;

    const selectedFile = files?.[0];

    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const isUploading = isAnalyzing && uploadProgress < 100;

  return (
    <section className="uploader-card">
      <div className="uploader-heading">
        <div>
          <span className="uploader-eyebrow">IMAGE FORENSICS</span>
          <h2>Verify an image</h2>
          <p>
            Upload a certificate, document, or image to inspect its content
            and verify its claims.
          </p>
        </div>

        <div className="uploader-heading-icon">
          <ScanSearch size={23} />
        </div>
      </div>

      {!file ? (
        <div
          className={`dropzone ${isDragging ? "dropzone-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();

            if (!isAnalyzing) {
              setIsDragging(true);
            }
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Choose an image to analyze"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={isAnalyzing}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="dropzone-icon">
            <Upload size={25} />
          </div>

          <h3>Drop your image here</h3>
          <p>or click to browse files</p>

          <div className="upload-formats">
            <span>PNG</span>
            <span>JPG</span>
            <span>WEBP</span>
            <span>MAX 10 MB</span>
          </div>
        </div>
      ) : (
        <div className="image-selected">
          <ImagePreview
            file={file}
            previewUrl={previewUrl}
            onRemove={onClear}
            disabled={isAnalyzing}
          />

          <div className="uploader-actions">
            <Button
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isAnalyzing}
            >
              Change image
            </Button>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={isAnalyzing}
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <Button
              onClick={onAnalyze}
              loading={isAnalyzing}
              disabled={isAnalyzing}
            >
              <ScanSearch size={17} />
              {isAnalyzing ? "Analyzing image..." : "Analyze image"}
            </Button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <UploadProgress
          progress={uploadProgress}
          isUploading={isUploading}
          isAnalyzing={isAnalyzing}
          message={
            isUploading
              ? "Uploading image"
              : "Analyzing image"
          }
        />
      )}

      <div className="uploader-privacy">
        <FileCheck2 size={15} />
        <span>
          Analysis results are estimates. Verify important claims using
          reliable sources.
        </span>
      </div>
    </section>
  );
};

export default ImageUploader;
