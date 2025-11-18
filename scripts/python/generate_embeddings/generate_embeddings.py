# docker compose up -d
# python3 -m venv .venv
# source .venv/bin/activate
# pip install --upgrade -r requirements.txt
# python generate_embeddings.py

import io
import requests
import torch
import psycopg2
from tqdm import tqdm
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import random
from torchvision import transforms

# -----------------------------
# Database config
# -----------------------------
DATABASE_URL = "postgresql://postgres:password@localhost:5432/pokedex"

# -----------------------------
# Device selection
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🖥️ Using device: {device}")

# -----------------------------
# Load model and processor
# -----------------------------
print("🔹 Loading CLIP model...")
model_id = "openai/clip-vit-base-patch16"
model = CLIPModel.from_pretrained(model_id)
model = model.to(device)  # Move to GPU/CPU
processor = CLIPProcessor.from_pretrained(model_id)
model.eval()

# Disable gradients for inference
for param in model.parameters():
    param.requires_grad = False

print(f"✅ Model loaded: {model_id}")
print(f"📊 Embedding dimension: 512")

# -----------------------------
# Connect to database
# -----------------------------
print("🔹 Connecting to Postgres...")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# -----------------------------
# Fetch cards
# -----------------------------
sets = [
]

for set in sets:
    SET_ID = set
    print(f"🔹 Fetching cards for set '{SET_ID}'...")
    cur.execute("""
        SELECT id, data
        FROM "Card"
        WHERE data->'set'->>'id' = %s
    """, (SET_ID,))
    cards = cur.fetchall()
    print(f"Found {len(cards)} cards.")

    augmentations = [
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.RandomPerspective(distortion_scale=0.2),
    ]

    # -----------------------------
    # Embedding function (MUST match embedding_service.py exactly)
    # -----------------------------
    def get_embeddings_with_augmentation(image_url: str, num_augmentations=5):
        """Generate multiple embeddings with augmentations"""
        embeddings = []
        
        try:
            resp = requests.get(image_url, timeout=15)
            resp.raise_for_status()
            image = Image.open(io.BytesIO(resp.content)).convert("RGB")
            
            # Original embedding
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                emb = model.get_image_features(**inputs)
                emb = emb / emb.norm(p=2, dim=-1, keepdim=True)
            embeddings.append(emb[0].cpu().tolist())
            
            # Augmented embeddings
            for i in range(num_augmentations):
                aug_image = image.copy()
                # Apply random augmentations
                for aug in random.sample(augmentations, k=random.randint(1, 3)):
                    aug_image = aug(aug_image)
                
                inputs = processor(images=aug_image, return_tensors="pt")
                inputs = {k: v.to(device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    emb = model.get_image_features(**inputs)
                    emb = emb / emb.norm(p=2, dim=-1, keepdim=True)
                embeddings.append(emb[0].cpu().tolist())
            
            # Average all embeddings
            avg_embedding = np.mean(embeddings, axis=0)
            # Re-normalize
            avg_embedding = avg_embedding / np.linalg.norm(avg_embedding)
            
            return avg_embedding.tolist()
        except Exception as e:
            print(f"❌ Failed: {e}")
            return None

    # -----------------------------
    # Process each card
    # -----------------------------
    success, fail = 0, 0
    for i, (card_id, data) in enumerate(tqdm(cards)):
        image_url = data.get("images", {}).get("large")
        if not image_url:
            fail += 1
            continue

        embedding = get_embeddings_with_augmentation(image_url)
        if embedding:
            # Verify embedding dimension
            if len(embedding) != 512:
                print(f"⚠️ Warning: Unexpected embedding dimension {len(embedding)} for {card_id}")
                fail += 1
                continue
                
            cur.execute(
                'UPDATE "Card" SET embedding = %s::vector WHERE id = %s',
                (f"[{','.join(map(str, embedding))}]", card_id),
            )
            success += 1
        else:
            fail += 1

    conn.commit()

    print(f"\n✅ Done! Updated {success} cards, failed {fail}.")
    print(f"📊 Success rate: {success/(success+fail)*100:.1f}%")

cur.close()
conn.close()