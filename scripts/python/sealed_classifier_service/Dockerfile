FROM python:3.11-slim

WORKDIR /app

# System deps for PIL, torch, etc.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model directory containing config.json, pytorch_model.bin, tokenizer files
COPY model /app/model

# Preload BERT classifier (optional but speeds first call)
RUN python - <<EOF
from transformers import BertForSequenceClassification, BertTokenizerFast
m = BertForSequenceClassification.from_pretrained("/app/model")
t = BertTokenizerFast.from_pretrained("/app/model")
print("Model preloaded")
EOF

# Copy service code
COPY classification_service.py .

EXPOSE 8000
CMD ["python", "classification_service.py"]
