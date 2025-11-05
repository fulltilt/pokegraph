# docker compose up -d
# python3 -m venv .ven
# source .venv/bin/activate
# pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
# python generate_embeddings.py

import io
import requests
import torch
import psycopg2
from tqdm import tqdm
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# -----------------------------
# Database config
# -----------------------------
DATABASE_URL = "postgresql://postgres:password@localhost:5432/pokedex"
SET_ID = "sv8pt5"

# -----------------------------
# Load model and processor
# -----------------------------
print("🔹 Loading CLIP model (CPU only)...")
model_id = "openai/clip-vit-base-patch16"
model = CLIPModel.from_pretrained(model_id)
processor = CLIPProcessor.from_pretrained(model_id)
model.eval()

# -----------------------------
# Connect to database
# -----------------------------
print("🔹 Connecting to Postgres...")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# -----------------------------
# Fetch cards
# -----------------------------
print(f"🔹 Fetching cards for set '{SET_ID}'...")
cur.execute("""
    SELECT id, data
    FROM "Card"
    WHERE data->'set'->>'id' = %s
""", (SET_ID,))
cards = cur.fetchall()
print(f"Found {len(cards)} cards.")

# -----------------------------
# Embedding function
# -----------------------------
def get_embedding(image_url: str):
    try:
        resp = requests.get(image_url, timeout=15)
        resp.raise_for_status()
        image = Image.open(io.BytesIO(resp.content)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            emb = model.get_image_features(**inputs)
            emb = emb / emb.norm(p=2, dim=-1, keepdim=True)
        return emb[0].tolist()
    except Exception as e:
        print(f"❌ Failed to process {image_url}: {e}")
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

    embedding = get_embedding(image_url)
    if embedding:
        cur.execute(
            'UPDATE "Card" SET embedding = %s::vector WHERE id = %s',
            (f"[{','.join(map(str, embedding))}]", card_id),
        )
        success += 1
    else:
        fail += 1

conn.commit()
cur.close()
conn.close()

print(f"\n✅ Done! Updated {success} cards, failed {fail}.")
