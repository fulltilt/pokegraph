from train import ListingDataset
from transformers import BertForSequenceClassification, BertTokenizer
from utils import load_labeled_data
import torch
from sklearn.metrics import classification_report
from torch.utils.data import DataLoader
import pandas as pd

df = load_labeled_data()

tokenizer = BertTokenizer.from_pretrained('./model')
model = BertForSequenceClassification.from_pretrained('./model')
model.eval()

val_ds = ListingDataset(df, tokenizer)
loader = DataLoader(val_ds, batch_size=16)

preds, trues = [], []
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

for batch in loader:
    input_ids = batch['input_ids'].to(device)
    attention_mask = batch['attention_mask'].to(device)
    labels = batch['label'].numpy()
    with torch.no_grad():
        output = model(input_ids, attention_mask=attention_mask)
        predictions = torch.argmax(output.logits, dim=1).cpu().numpy()
    preds.extend(predictions)
    trues.extend(labels)

print(classification_report(trues, preds, target_names=["remove", "keep"]))

'''
              precision    recall  f1-score   support

      remove       0.99      0.86      0.92       193
        keep       0.98      1.00      0.99      1346

    accuracy                           0.98      1539
   macro avg       0.99      0.93      0.96      1539
weighted avg       0.98      0.98      0.98      1539
'''