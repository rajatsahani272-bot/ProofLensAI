
import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

const analyzeImage = async (file) => {
  if (!process.env.AI_SERVICE_API_KEY) {
    throw new Error("AI_SERVICE_API_KEY is missing in Backend/.env");
  }

  const form = new FormData();

  form.append("file", fs.createReadStream(file.path), {
    filename: file.originalname,
    contentType: file.mimetype
  });

  const response = await axios.post(
    `${AI_SERVICE_URL}/analyze`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        "x-ai-service-key": process.env.AI_SERVICE_API_KEY
      },
      timeout: 180000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  );

  return response.data;
};

export default analyzeImage;
