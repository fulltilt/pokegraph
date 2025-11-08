# embedding_service.py - Updated to use custom YOLO model

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image
import io
import numpy as np
from contextlib import asynccontextmanager
from typing import List
import os

# Global models
model = None
processor = None
device = None
detector = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, processor, device, detector
    
    print("🔹 Loading models...")
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️ Using device: {device}")
    
    # Load CLIP model
    model_id = "openai/clip-vit-base-patch16"
    model = CLIPModel.from_pretrained(model_id)
    model = model.to(device)
    processor = CLIPProcessor.from_pretrained(model_id)
    model.eval()
    
    for param in model.parameters():
        param.requires_grad = False
    
    print(f"✅ CLIP model loadxed on {device}")
    
    # Load YOLO detector
    print("🔍 Attempting to load YOLO detector...")
    try:
        print("   Step 1: Importing ultralytics...")
        from ultralytics import YOLO
        print("   ✅ ultralytics imported successfully", flush=True)
        
        # Check for custom trained model
        custom_model_path = os.getenv('YOLO_MODEL_PATH', 'models/card_detector.pt')
        print(f"   Step 2: Looking for model at: {custom_model_path}")
        print(f"   Current working directory: {os.getcwd()}")
        print(f"   Files in current dir: {os.listdir('.')}")
        
        if os.path.exists(custom_model_path):
            print(f"   ✅ Custom model found!")
            print(f"   Step 3: Loading custom model...")
            detector = YOLO(custom_model_path)
            print(f"   ✅ Custom YOLO model loaded - TRAINED FOR CARDS!")
        else:
            print(f"   ⚠️ Custom model not found at {custom_model_path}")
            print(f"   Checking if directory exists: {os.path.dirname(custom_model_path)}")
            if os.path.dirname(custom_model_path):
                dir_path = os.path.dirname(custom_model_path)
                if os.path.exists(dir_path):
                    print(f"   Directory exists. Contents: {os.listdir(dir_path)}")
                else:
                    print(f"   Directory doesn't exist!")
            
            print("   📦 Loading pretrained YOLOv8n (not trained on cards)")
            detector = YOLO('yolov8n.pt')
            print("   ⚠️ Note: Pretrained YOLO won't detect cards well!")

    except ImportError as e:
        print(f"❌ Import error: {e}", flush=True)
        print("   Install with: pip install ultralytics", flush=True)
        detector = None
        import traceback
        traceback.print_exc()
        
    except Exception as e:
        print(f"❌ Error loading YOLO: {e}", flush=True)
        print(f"   Error type: {type(e).__name__}", flush=True)
        detector = None
        import traceback
        traceback.print_exc()

    print(f"🏁 YOLO loading complete. detector={'loaded' if detector else 'None'}", flush=True)
    
    yield
    
    print("🛑 Shutting down...")
    del model
    del processor
    del detector
    if device.type == "cuda":
        torch.cuda.empty_cache()

app = FastAPI(title="Card Embedding Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_cards(image: Image.Image, conf_threshold: float = 0.25) -> List[Image.Image]:
    """
    Detect individual cards in an image using YOLO.
    
    Args:
        image: Input PIL Image
        conf_threshold: Confidence threshold for detections
    
    Returns:
        List of cropped card images
    """
    if detector is None:
        print("⚠️ YOLO not available, using full image")
        return [image]
    
    # Convert PIL to numpy array
    img_array = np.array(image)
    
    # Run detection
    results = detector(img_array, verbose=False, conf=conf_threshold)
    
    detected_cards = []
    
    for result in results:
        boxes = result.boxes
        
        if len(boxes) == 0:
            print("⚠️ No cards detected, using full image")
            return [image]
        
        # Sort by confidence (highest first)
        confidences = boxes.conf.cpu().numpy()
        sorted_indices = np.argsort(confidences)[::-1]
        
        for idx in sorted_indices:
            box = boxes[idx]
            confidence = float(box.conf)
            
            if confidence < conf_threshold:
                continue
            
            # Get bounding box
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # Add 5% padding
            padding = 0.05
            width = x2 - x1
            height = y2 - y1
            
            x1 = max(0, int(x1 - width * padding))
            y1 = max(0, int(y1 - height * padding))
            x2 = min(image.width, int(x2 + width * padding))
            y2 = min(image.height, int(y2 + height * padding))
            
            # Crop card
            card_img = image.crop((x1, y1, x2, y2))
            detected_cards.append(card_img)
            
            print(f"✂️ Card detected: ({x1},{y1})->({x2},{y2}) conf={confidence:.2%}")
    
    return detected_cards if detected_cards else [image]

def generate_embedding(image: Image.Image) -> List[float]:
    """Generate CLIP embedding for a single card image"""
    inputs = processor(images=image, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        emb = model.get_image_features(**inputs)
        emb = emb / emb.norm(p=2, dim=-1, keepdim=True)
    
    return emb[0].cpu().tolist()

@app.post("/detect-and-embed")
async def detect_and_embed(
    file: UploadFile = File(...),
    conf_threshold: float = 0.25
):
    """
    Detect multiple cards and generate embeddings for each.
    
    Query params:
        conf_threshold: Detection confidence threshold (0.1-0.9)
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        print(f"📸 Image: {image.size[0]}x{image.size[1]}px")
        
        # Detect cards
        cards = detect_cards(image, conf_threshold=conf_threshold)
        print(f"🎴 Detected {len(cards)} card(s)")
        
        # Generate embeddings
        results = []
        for i, card_img in enumerate(cards):
            embedding = generate_embedding(card_img)
            results.append({
                "card_index": i,
                "embedding": embedding,
                "dimension": len(embedding),
                "card_size": {
                    "width": card_img.width,
                    "height": card_img.height
                }
            })
        
        return {
            "cards_detected": len(cards),
            "cards": results,
            "model": "openai/clip-vit-base-patch16",
            "detector": "custom" if "card_detector" in str(detector.ckpt_path) else "pretrained"
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    detector_info = None
    if detector:
        model_path = str(detector.ckpt_path) if hasattr(detector, 'ckpt_path') else "unknown"
        is_custom = "card_detector" in model_path or "best.pt" in model_path
        detector_info = {
            "loaded": True,
            "type": "custom_trained" if is_custom else "pretrained",
            "path": model_path
        }
    
    return {
        "status": "ok",
        "clip_model": "openai/clip-vit-base-patch16",
        "detector": detector_info
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Card Embedding Service...")
    uvicorn.run(app, host="0.0.0.0", port=8000)