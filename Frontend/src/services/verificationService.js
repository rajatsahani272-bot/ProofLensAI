
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
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
