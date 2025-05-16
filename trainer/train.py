import logging
import torch
import pandas as pd
from transformers import BertTokenizerFast, BertForSequenceClassification #BertTokenizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from torch.utils.data import Dataset, DataLoader
from utils import load_labeled_data

# -----------------------
# Logging Setup
# -----------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# -----------------------
# Dataset Class
# -----------------------
class ListingDataset(Dataset):
    def __init__(self, df, tokenizer):
        self.texts = [f"{p} {t} ${pr}" for p, t, pr in zip(df['product'], df['title'], df['price'])]
        self.labels = [1 if lbl == "keep" else 0 for lbl in df['label']]
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(self.texts[idx], padding='max_length', truncation=True, max_length=128, return_tensors="pt")
        return {
            "input_ids": enc['input_ids'].squeeze(),
            "attention_mask": enc['attention_mask'].squeeze(),
            "label": torch.tensor(self.labels[idx])
        }

# -----------------------
# Load and Split Data
# -----------------------
logging.info("Loading labeled data...")
df = load_labeled_data()
logging.info(f"Loaded {len(df)} labeled entries")

train_df, val_df = train_test_split(df, test_size=0.2, stratify=df['label'])
logging.info(f"Split into {len(train_df)} train and {len(val_df)} validation samples")

# -----------------------
# Tokenizer & Dataset
# -----------------------
logging.info("Loading tokenizer and preparing datasets...")
# tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

train_ds = ListingDataset(train_df, tokenizer)
val_ds = ListingDataset(val_df, tokenizer)

train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=16)

# -----------------------
# Setup Model Training
# -----------------------
device = torch.device('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')
model.to(device)
logging.info(f"Using device: {device}")

optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)

# -----------------------
# Training Loop
# -----------------------
logging.info("Starting training...")
for epoch in range(3):
    logging.info(f"Epoch {epoch+1}/3")
    model.train()
    total_loss = 0
    for i, batch in enumerate(train_loader):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)

        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        total_loss += loss.item()
        if (i + 1) % 10 == 0 or (i + 1) == len(train_loader):
            logging.info(f"  [Batch {i+1}/{len(train_loader)}] Loss: {loss.item():.4f}")

    avg_loss = total_loss / len(train_loader)
    logging.info(f"Epoch {epoch+1} average loss: {avg_loss:.4f}")

# -----------------------
# Save Model
# -----------------------
logging.info("Saving model to ./model...")
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")
logging.info("Model and tokenizer saved successfully.")
