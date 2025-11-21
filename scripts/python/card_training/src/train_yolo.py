"""
Simple YOLOv8 Training Script for Card Detection
Run: python train_yolo.py
"""

import os
import json
import shutil
from pathlib import Path
from ultralytics import YOLO
import yaml

def convert_label_studio_to_yolo(json_path, images_dir, output_dir):
    """Convert Label Studio JSON to YOLO format"""
    
    print("=" * 60)
    print("STEP 1: Converting Label Studio annotations to YOLO format")
    print("=" * 60)
    
    output_path = Path(output_dir)
    images_path = output_path / "images"
    labels_path = output_path / "labels"
    
    # Create directories
    for split in ["train", "val"]:
        (images_path / split).mkdir(parents=True, exist_ok=True)
        (labels_path / split).mkdir(parents=True, exist_ok=True)
    
    # Load annotations
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    print(f"\n📦 Found {len(data)} annotated images")
    
    # Split: 80% train, 20% val
    split_idx = int(len(data) * 0.8)
    train_data = data[:split_idx]
    val_data = data[split_idx:]
    
    print(f"   Training: {len(train_data)} images")
    print(f"   Validation: {len(val_data)} images")
    
    def process_split(items, split_name):
        print(items)
        processed = 0
        skipped = 0
        
        for item in items:
            # Get image filename
            if 'file_upload' in item:
                image_filename = item['file_upload'].split('/')[-1]
            elif 'data' in item and 'image' in item['data']:
                image_filename = item['data']['image'].split('/')[-1]
            else:
                print(f"⚠️ Skipping item - no image path found")
                skipped += 1
                continue
            
            image_path = Path(images_dir) / image_filename
            
            if not image_path.exists():
                print(f"⚠️ Image not found: {image_path}")
                skipped += 1
                continue
            
            # Copy image
            dest_image = images_path / split_name / image_filename
            shutil.copy(image_path, dest_image)
            
            # Get annotations
            if not item.get('annotations') or len(item['annotations']) == 0:
                print(f"⚠️ No annotations for {image_filename}")
                skipped += 1
                continue
            
            annotation = item['annotations'][0]
            
            # Get image dimensions
            if 'original_width' in annotation:
                img_width = annotation['original_width']
                img_height = annotation['original_height']
            else:
                # Fallback: open image to get dimensions
                from PIL import Image
                img = Image.open(image_path)
                img_width, img_height = img.size
            
            # Process bounding boxes
            yolo_lines = []
            for result in annotation.get('result', []):
                if result.get('type') == 'rectanglelabels':
                    value = result['value']
                    
                    # Label Studio uses percentages
                    x_pct = value['x'] / 100
                    y_pct = value['y'] / 100
                    w_pct = value['width'] / 100
                    h_pct = value['height'] / 100
                    
                    # Convert to YOLO format (center x, center y, width, height)
                    x_center = x_pct + w_pct / 2
                    y_center = y_pct + h_pct / 2
                    
                    # Class 0 = card
                    yolo_lines.append(f"0 {x_center:.6f} {y_center:.6f} {w_pct:.6f} {h_pct:.6f}")
            
            if len(yolo_lines) == 0:
                print(f"⚠️ No boxes found for {image_filename}")
                skipped += 1
                continue
            
            # Save label file
            label_filename = image_filename.rsplit('.', 1)[0] + '.txt'
            label_path = labels_path / split_name / label_filename
            
            with open(label_path, 'w') as f:
                f.write('\n'.join(yolo_lines))
            
            processed += 1
        
        print(f"   {split_name}: Processed {processed}, Skipped {skipped}")
        return processed
    
    train_count = process_split(train_data, "train")
    val_count = process_split(val_data, "val")
    
    # Create dataset.yaml
    dataset_yaml = {
        'path': str(output_path.absolute()),
        'train': 'images/train',
        'val': 'images/val',
        'nc': 1,
        'names': ['card']
    }
    
    yaml_path = output_path / 'dataset.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(dataset_yaml, f, default_flow_style=False)
    
    print(f"\n✅ Dataset created at: {output_path}")
    print(f"   Config file: {yaml_path}")
    
    return str(yaml_path), train_count, val_count


def train_model(dataset_yaml, epochs=50, img_size=640, batch_size=16):
    """Train YOLOv8 model"""
    
    print("\n" + "=" * 60)
    print("STEP 2: Training YOLOv8n on your card dataset")
    print("=" * 60)
    
    print(f"\n📊 Training configuration:")
    print(f"   Model: YOLOv8n (nano)")
    print(f"   Epochs: {epochs}")
    print(f"   Image size: {img_size}")
    print(f"   Batch size: {batch_size}")
    print(f"   Device: {'GPU' if __import__('torch').cuda.is_available() else 'CPU'}")
    
    # Load pretrained YOLOv8n
    print("\n🔹 Loading pretrained YOLOv8n...")
    model = YOLO('yolov8n.pt')
    
    # Start training
    print("\n🚀 Starting training... (this will take a while)")
    print("   You can monitor progress in the terminal")
    print("   Press Ctrl+C to stop early (model will still be saved)\n")
    
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        patience=20,  # Early stopping if no improvement
        save=True,
        device=0 if __import__('torch').cuda.is_available() else 'cpu',
        project='runs/card_detection',
        name='train',
        exist_ok=True,
        pretrained=True,
        optimizer='AdamW',
        verbose=True,
        # Data augmentation
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,
    )
    
    print("\n✅ Training complete!")
    print(f"\n📁 Results saved to: runs/card_detection/train/")
    print(f"   Best model: runs/card_detection/train/weights/best.pt")
    print(f"   Last model: runs/card_detection/train/weights/last.pt")
    
    return model


def evaluate_model(model_path, dataset_yaml):
    """Evaluate the trained model"""
    
    print("\n" + "=" * 60)
    print("STEP 3: Evaluating model performance")
    print("=" * 60)
    
    model = YOLO(model_path)
    metrics = model.val(data=dataset_yaml)
    
    print(f"\n📊 Model Performance:")
    print(f"   mAP50:     {metrics.box.map50:.3f}  (should be > 0.70)")
    print(f"   mAP50-95:  {metrics.box.map:.3f}   (overall accuracy)")
    print(f"   Precision: {metrics.box.mp:.3f}   (false positive rate)")
    print(f"   Recall:    {metrics.box.mr:.3f}   (detection rate)")
    
    if metrics.box.map50 > 0.80:
        print("\n🎯 Excellent! Your model is production-ready!")
    elif metrics.box.map50 > 0.70:
        print("\n✅ Good! Model should work well for most cases.")
    elif metrics.box.map50 > 0.60:
        print("\n⚠️ Acceptable, but could be improved with more data.")
    else:
        print("\n❌ Low accuracy. Try:")
        print("   - Add more training images (aim for 100+)")
        print("   - Check annotation quality")
        print("   - Train longer (more epochs)")
    
    return metrics


def test_on_image(model_path, test_image):
    """Test model on a single image"""
    
    print("\n" + "=" * 60)
    print("STEP 4: Testing on sample image")
    print("=" * 60)
    
    model = YOLO(model_path)
    results = model.predict(
        test_image, 
        save=True, 
        conf=0.8, 
        iou=0.4,  # Non-maximum suppression threshold
        verbose=True
    )
    
    detections = results[0].boxes
    print(f"\n🎴 Detected {len(detections)} card(s)")
    
    for i, box in enumerate(detections):
        conf = float(box.conf)
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        width = x2 - x1
        height = y2 - y1
        aspect_ratio = width / height
        
        # Pokemon cards are roughly 2.5:3.5 = 0.71 aspect ratio
        if 0.55 < aspect_ratio < 0.85:
            valid_detections.append((i, conf, x1, y1, x2, y2, aspect_ratio))
            print(f"   ✅ Card {i+1}: conf={conf:.2%}, box=[{x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f}], ratio={aspect_ratio:.2f}")
        else:
            print(f"   ❌ Filtered (bad ratio {aspect_ratio:.2f}): conf={conf:.2%}")
    
    
    print(f"\n📊 Valid detections after filtering: {len(valid_detections)}/{len(detections)}")
    print(f"💾 Prediction saved to: runs/detect/predict/")
    
    return results


def main():
    """Main training pipeline"""
    
    print("\n" + "=" * 60)
    print("YOLOv8 Card Detection Training Pipeline")
    print("=" * 60)
    
    # Configuration
    LABEL_STUDIO_JSON = "label_studio_export.json"
    IMAGES_DIR = "training_images"
    OUTPUT_DIR = "card_dataset"
    
    # Check files exist
    if not os.path.exists(LABEL_STUDIO_JSON):
        print(f"\n❌ Error: {LABEL_STUDIO_JSON} not found!")
        print("   Export your annotations from Label Studio as JSON")
        return
    
    if not os.path.exists(IMAGES_DIR):
        print(f"\n❌ Error: {IMAGES_DIR} directory not found!")
        print("   Create this folder and put your training images in it")
        return
    
    # Step 1: Convert annotations
    dataset_yaml, train_count, val_count = convert_label_studio_to_yolo(
        json_path=LABEL_STUDIO_JSON,
        images_dir=IMAGES_DIR,
        output_dir=OUTPUT_DIR
    )
    
    if train_count == 0:
        print("\n❌ No training images processed! Check your annotations.")
        return
    
    # Step 2: Train model
    model = train_model(
        dataset_yaml=dataset_yaml,
        epochs=50,
        img_size=640,
        batch_size=16  # Reduce to 8 or 4 if you get OOM errors
    )
    
    # Step 3: Evaluate
    best_model_path = 'runs/card_detection/train/weights/best.pt'
    metrics = evaluate_model(best_model_path, dataset_yaml)
    
    # Step 4: Test on first training image (optional)
    first_image = list(Path(IMAGES_DIR).glob('*'))[0]
    test_on_image(best_model_path, str(first_image))
    
    # Final instructions
    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 60)
    
    print("\n📦 Next steps:")
    print("   1. Check training results: runs/card_detection/train/")
    print("   2. Your trained model: runs/card_detection/train/weights/best.pt")
    print(f"   3. Model performance: mAP50 = {metrics.box.map50:.3f}")
    
    print("\n🚀 To use in production:")
    print("   1. Copy best.pt to your embedding service:")
    print("      cp runs/card_detection/train/weights/best.pt \\")
    print("         scripts/python/embedding_service/models/card_detector.pt")
    print("\n   2. Rebuild Docker:")
    print("      docker compose build embedding-service")
    print("      docker compose up -d embedding-service")
    
    print("\n💡 To improve accuracy:")
    print("   - Add more training images (100+ recommended)")
    print("   - Use larger model: change to yolov8s.pt or yolov8m.pt")
    print("   - Train longer: increase epochs to 100")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Training interrupted by user")
        print("   Partial model may be saved in runs/card_detection/train/")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
