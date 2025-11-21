import os
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ------------------------------
# CONFIG
# ------------------------------

MODEL_NAME = os.getenv("MODEL_NAME", "/app/model")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 32))

# ------------------------------
# FASTAPI APP
# ------------------------------

app = FastAPI(title="Classifier Service", version="1.0.0")

# ------------------------------
# DATA MODELS
# ------------------------------

class ClassifyRequest(BaseModel):
    items: list[str]

class Prediction(BaseModel):
    label: str
    score: float

class ClassifyResponse(BaseModel):
    predictions: list[Prediction]


# ------------------------------
# MODEL LOADING
# ------------------------------

print(f"Loading model '{MODEL_NAME}' on device '{DEVICE}'...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.to(DEVICE)
model.eval()

LABELS = ["keep", "remove"]  # index 0 = keep, index 1 = remove


# ------------------------------
# BATCHED INFERENCE
# ------------------------------

def classify_batch(text_list: list[str]):
    """Run batched inference and return predictions."""
    results = []

    for i in range(0, len(text_list), BATCH_SIZE):
        batch = text_list[i : i + BATCH_SIZE]

        enc = tokenizer(
            batch,
            padding=True,
            truncation=True,
            return_tensors="pt",
            max_length=128,
        ).to(DEVICE)

        with torch.no_grad():
            logits = model(**enc).logits
            probs = torch.softmax(logits, dim=-1)

        # Convert to Python values
        for prob_tensor in probs:
            prob = prob_tensor.cpu().tolist()
            max_idx = prob_tensor.argmax().item()
            label = LABELS[max_idx]
            score = prob[max_idx]

            results.append(
                {"label": label, "score": float(score)}
            )

    return results

# ------------------------------
# ROUTES
# ------------------------------

@app.post("/classify", response_model=ClassifyResponse)
async def classify(req: ClassifyRequest):
    predictions = classify_batch(req.items)
    return ClassifyResponse(predictions=predictions)


@app.get("/health")
async def health():
    return {"status": "ok", "device": DEVICE}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Sealed Classifier Service...")
    uvicorn.run("classification_service:app", host="0.0.0.0", port=8000, reload=False)
