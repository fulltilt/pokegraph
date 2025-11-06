FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from transformers import pipeline; pipeline('feature-extraction', model='openai/clip-vit-base-patch32')"

# Copy service
COPY embedding_service.py .

EXPOSE 8000

CMD ["python", "embedding_service.py"]