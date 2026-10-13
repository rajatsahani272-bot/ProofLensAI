
import { useCallback, useEffect, useState } from "react";
import { analyzeImage } from "../services/verificationService.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const useVerification = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectFile = useCallback((selectedFile) => {
    setError("");

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 10 MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(selectedFile));
    setFile(selectedFile);
    setResult(null);
    setUploadProgress(0);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setUploadProgress(0);
  }, []);

  const updateClaim = useCallback((value) => {
    setClaim(value);
    setError("");
  }, []);

  const analyze = useCallback(async () => {
    if (!file || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setResult(null);
    setUploadProgress(0);

    try {
      const response = await analyzeImage(
        file,
        claim,
        setUploadProgress
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Image analysis could not be completed."
        );
      }

      setResult(response);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      setError(
        message ||
          (err.code === "ECONNABORTED"
            ? "Analysis timed out. Please try again."
            : status === 413
              ? "Image is too large for the server."
              : status === 400
                ? "Invalid image or request. Please check your input."
                : "Unable to analyze the image. Check that the backend and AI service are running.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, claim, isAnalyzing]);

  return {
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
  };
};

export default useVerification;
