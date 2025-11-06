# embedding_service.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image
import io
from contextlib import asynccontextmanager
import uvicorn

# Globals to hold model and processor
model = None
processor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, processor
    print("🔹 Loading CLIP model...")
    model_id = "openai/clip-vit-base-patch16"
    model = CLIPModel.from_pretrained(model_id)
    processor = CLIPProcessor.from_pretrained(model_id)
    model.eval()
    print("✅ CLIP model loaded successfully")
    yield  # 👈 everything before this runs on startup, after this runs on shutdown
    print("🛑 Shutting down, freeing resources...")
    del model
    del processor

app = FastAPI(title="Card Embedding Service", lifespan=lifespan)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/embed")
async def create_embedding(file: UploadFile = File(...)):
    """Generate CLIP embedding for an uploaded image"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")

        with torch.no_grad():
            emb = model.get_image_features(**inputs)
            emb = emb / emb.norm(p=2, dim=-1, keepdim=True)

        embedding_list = emb[0].tolist()

        return {
            "embedding": embedding_list,
            "dimension": len(embedding_list),
            "model": "openai/clip-vit-base-patch16"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": "openai/clip-vit-base-patch16"
    }

if __name__ == "__main__":
    print("🚀 Starting Card Embedding Service on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
