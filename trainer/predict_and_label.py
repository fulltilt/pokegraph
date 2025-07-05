from transformers import BertTokenizer, BertForSequenceClassification
from utils import load_unlabeled_data, update_labels
import torch
from config import CONFIDENCE_THRESHOLD

model = BertForSequenceClassification.from_pretrained("./model")
tokenizer = BertTokenizer.from_pretrained("./model")
model.eval()

unlabeled_df = load_unlabeled_data()
texts = [f"{p} {t} ${pr}" for p, t, pr in zip(unlabeled_df['product'], unlabeled_df['title'], unlabeled_df['price'])]

predictions = []
for i, text in enumerate(texts):
    enc = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
    with torch.no_grad():
        output = model(**enc)
        probs = torch.nn.functional.softmax(output.logits, dim=1)
        confidence, pred = torch.max(probs, dim=1)
        if confidence.item() >= CONFIDENCE_THRESHOLD:
            label = "keep" if pred.item() == 1 else "remove"
            predictions.append((unlabeled_df.iloc[i]['id'], label))

update_labels(predictions)
