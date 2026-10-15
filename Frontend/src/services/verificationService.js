
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://prooflens-backend.icycliff-58dedabd.centralindia.azurecontainerapps.io/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 240000
});

export const analyzeImage = async (
  file,
  claim = "",
  onUploadProgress
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("claim", claim.trim());

  const response = await api.post(
    "/verification/analyze",
    formData,
    {
      onUploadProgress: (event) => {
        if (onUploadProgress && event.total) {
          const progress = Math.round(
            (event.loaded * 100) / event.total
          );

          onUploadProgress(progress);
        }
      }
    }
  );

  return response.data;
};

export default api;
