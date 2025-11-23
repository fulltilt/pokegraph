FROM python:3.11-slim

WORKDIR /app

# 🧩 Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt

# Preload model (optional optimization)
RUN python -c "from transformers import pipeline; pipeline('feature-extraction', model='openai/clip-vit-base-patch32')"

# Create models directory
RUN mkdir -p /app/models

# Copy your trained model
COPY models/card_detector.pt /app/models/card_detector.pt

# COPY /app/scripts//sealed_classifier_service/model /app/text_model

# Set environment variable
ENV YOLO_MODEL_PATH=/app/models/card_detector.pt

# Copy service
COPY embedding_service.py .

EXPOSE 8000

CMD ["python", "embedding_service.py"]
