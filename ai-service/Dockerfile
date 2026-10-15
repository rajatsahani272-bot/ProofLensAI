FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PORT=8001
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 libglib2.0-0 libgl1 && rm -rf /var/lib/apt/lists/*
COPY ai-service/requirements.txt ./ai-service/requirements.txt
RUN pip install --no-cache-dir -r ai-service/requirements.txt && pip install --no-cache-dir torch==2.11.0 --index-url https://download.pytorch.org/whl/cpu
COPY ai-service ./ai-service
COPY AIML ./AIML
EXPOSE 8001
CMD ["sh", "-c", "uvicorn app:app --app-dir ai-service --host 0.0.0.0 --port ${PORT:-8001}"]
