from azure_adapter import download_file_and_save, upload_model, get_blob_name, download_model_file
from typing import Sequence
from interfaces.index import TrainingManifest, InferenceManifest, Hyperparameters
from ultralytics import YOLO

from PIL import Image
import albumentations as A
from sklearn.model_selection import train_test_split

from typing import Dict
import cv2
import yaml 
import os


def augment_and_process_image(image, bbox, target_size):
    
    try:
        bbox = [max(0, min(1, v)) for v in bbox]

        transform = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.Rotate(limit=10, p=0.5),
            A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.2, rotate_limit=10, p=0.5)
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
        
        retry_count = 0
        max_retries = 3

        while retry_count < max_retries:
            augmented = transform(image=image, bboxes=[bbox], class_labels=[0])
    

            if not len(augmented['bboxes']):
                print(f"Retry {retry_count+1}/{max_retries}: Bounding box removed by augmentation")
                retry_count += 1
                return image, bbox
            
            image = augmented['image']
    
            image = augmented['image']
            bbox = augmented['bboxes'][0]

            # Resize while preserving aspect ratio and pad to target size
            h, w = image.shape[:2]
            scale = min(target_size[0] / h, target_size[1] / w)
            new_h, new_w = int(h * scale), int(w * scale)
            
            resized_image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
            top = (target_size[0] - new_h) // 2
            bottom = target_size[0] - new_h - top
            left = (target_size[1] - new_w) // 2
            right = target_size[1] - new_w - left

            padded_image = cv2.copyMakeBorder(resized_image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=[0, 0, 0])
            
            # Adjust bbox after resizing and padding
            x_center, y_center, bbox_width, bbox_height = bbox
            x_center = (x_center * new_w + left) / target_size[1]
            y_center = (y_center * new_h + top) / target_size[0]
            bbox_width = bbox_width * new_w / target_size[1]
            bbox_height = bbox_height * new_h / target_size[0]

            adjusted_bbox = [x_center, y_center, bbox_width, bbox_height]

            return padded_image, adjusted_bbox

    except Exception as e:
        print(f"Error processing image: {e}")
        return image, bbox

def normalize_label(
    label_data,
    filename,
    image_path,
):
    label_boundary = label_data.split(' ')
    
    float_label_data = [float(element) for element in label_boundary]
    if len(float_label_data) != 4:
        raise ValueError(f"Label data should have 4 elements, but got {len(float_label_data)}")
    
    x_top_left, y_top_left, width_box, height_box = float_label_data

    # Ensure bounding box dimensions are positive
    if width_box <= 0 or height_box <= 0:
        raise ValueError(f"Bounding box dimensions must be positive: {filename} has widht{width_box} and height{height_box}")

    image = Image.open(image_path)
    width, height = image.size
    
    # Normalize the bounding box values
    x_center = x_top_left + width_box / 2.0
    y_center = y_top_left + height_box / 2.0
    x_center /= width
    y_center /= height
    yolo_width = (width_box / width) - (1 / width)
    yolo_height = (height_box / height) - (1 / height)

    # Ensure that all normalized values are within [0, 1]
    if any(val < 0 or val > 1 for val in [x_center, y_center, yolo_width, yolo_height]):
        raise ValueError("Normalized values must be between 0 and 1")
    # Write the YOLO formatted label to file
    return [x_center, y_center, yolo_width, yolo_height]


async def preload_images(manifest: TrainingManifest):
    images = manifest.images.items()

    for image in images:
        file_uuid, filename = image


        image_saving_filename = file_uuid + os.path.splitext(filename)[1]
        blob_name = get_blob_name(filename, file_uuid)
        test = os.path.join(os.getenv('DATASET_DIR'), 'source')
        await download_file_and_save(blob_name, image_saving_filename, test)


def prepare_and_save_label_and_image(
    image_path: str, 
    labels,
    defects,
    output_dir,
    target_size
):
    image_filename = os.path.splitext(os.path.basename(image_path))[0]

    image_label_data = labels[image_filename].label_data

    image_label_defect_id = str(labels[image_filename].defect_id)
    image_defect_name = defects.get(image_label_defect_id, 'unknown_defect')
    image = cv2.imread(image_path)
    x_center, y_center, width_box, height_box = normalize_label(image_label_data, image_filename, image_path)

    bbox = [x_center, y_center, width_box, height_box]

    processed_image, bbox = augment_and_process_image(image, bbox, target_size)

    output_image_path_dir = os.path.join(output_dir, image_defect_name)
    os.makedirs(output_image_path_dir, exist_ok=True)

    cv2.imwrite(os.path.join(output_image_path_dir, os.path.basename(image_path)), processed_image)

    label_output_path =  os.path.join(output_dir, image_defect_name).replace('images', 'labels')
    os.makedirs(label_output_path, exist_ok=True)
    file_name, file_extension = os.path.splitext(os.path.basename(image_path))

    # Replace extension with .txt
    label_file_name = file_name + '.txt'    

    with open(os.path.join(label_output_path, label_file_name), 'w+') as label_file:

        for idx, defect_class_id in enumerate(defects):
            if int(defect_class_id) == int(image_label_defect_id):
                yolo_bbox = [idx] + bbox
                label_file.write(' '.join(map(str, yolo_bbox)))



async def prepare_dataset(manifest: TrainingManifest, hyperparameters: Hyperparameters):

    await preload_images(manifest)
    # Example usage
    dataset_dir = os.getenv('DATASET_DIR')
    image_dir = os.path.join(dataset_dir, 'source')
    # List all PNG, JPG, and JPEG images
    image_paths = [os.path.join(image_dir, img) for img in os.listdir(image_dir) if img.lower().endswith(('.png', '.jpg', '.jpeg'))]

    target_size = (hyperparameters['target_image_size'], hyperparameters['target_image_size'])
    
    train_output_dir = os.path.join(dataset_dir, 'images/train_processed')
    val_output_dir = os.path.join(dataset_dir, 'images/val_processed')

    os.makedirs(train_output_dir, exist_ok=True)
    os.makedirs(val_output_dir, exist_ok=True)

    labels = manifest.labels
    defects = manifest.defects

    train_images, val_images = train_test_split(image_paths, train_size=hyperparameters['train_size_coeficient'], random_state=42)

    for image_path in train_images:
        prepare_and_save_label_and_image(image_path, labels, defects, train_output_dir, target_size)

    for image_path in val_images:
        prepare_and_save_label_and_image(image_path, labels, defects, val_output_dir, target_size)

    save_yaml_file(defects, train_output_dir, val_output_dir)

def save_yaml_file(
    defects: Dict[str, str],
    train_dir: str,
    val_dir: str
):
    defect_names = []

    for defect_id, defect_name in defects.items():
        defect_names.append(defect_name)

    config_data = {
        'path': os.getenv('DATASET_DIR'),
        'train': train_dir,
        'val': val_dir,
        'nc': len(defects),  # number of classes
        'names': defect_names  # class names
    }

    yaml_filepath = os.path.join( os.getenv('DATASET_DIR'), "dataset.yaml" )

    with open(yaml_filepath, 'w+') as file:
        yaml.dump(config_data, file, default_flow_style=False)


def resize_images(directory_path, width, height):
    # Supported image extensions
    supported_extensions = ['.jpg', '.jpeg', '.png']

    # Loop through all files in the directory
    for filename in os.listdir(directory_path):
        # Check if the file is an image
        if any(filename.lower().endswith(ext) for ext in supported_extensions):
            image_path = os.path.join(directory_path, filename)
            
            # Read the image
            image = cv2.imread(image_path)
            
            if image is None:
                print(f"Error: Could not read image from {image_path}")
                continue

            # Resize the image
            resized_image = cv2.resize(image, (width, height), interpolation=cv2.INTER_LINEAR)

            # Save the resized image, replacing the old one
            cv2.imwrite(image_path, resized_image)
            print(f"Resized image saved to {image_path}")

 # Function to process predictions and filter based on defects
def process_predictions(predictions, defect_mapping):
    result = {}
    for res in predictions:
        image_path = res.path
        boxes = res.boxes.xyxy.cpu().numpy()  # Bounding boxes
        labels = res.boxes.cls.cpu().numpy()  # Class labels
        confidences = res.boxes.conf.cpu().numpy()  # Confidence scores
        # Get the filename from the image path
        filename = os.path.splitext(os.path.basename(image_path))[0]

        if len(confidences) == 0:
            continue

        # Dictionary to store the highest confidence for each defect type
        defect_confidences = {defect: [] for defect in defect_mapping.values()}

        for box, label, confidence in zip(boxes, labels, confidences):

            label_id = str(int(label) + 1)
            label_name = defect_mapping[label_id]

            if label_name in defect_confidences:
                defect_confidences[label_name].append((box, confidence, label_id))

        # Select the most confident labels for each defect
        filtered_defects = {}
        for defect, bbox_conf_list in defect_confidences.items():
            if bbox_conf_list:
                # Select the bounding box with the highest confidence for this defect
                best_bbox, best_confidence, label_id = max(bbox_conf_list, key=lambda x: x[1])
                filtered_defects[defect] = {
                    'bbox': best_bbox.tolist(),
                    'confidence': best_confidence,
                    'defect_class_id': label_id
                }

        # If there is any defect other than 'ok', remove 'ok'
        if any(defect != 'OK' for defect in filtered_defects):
            filtered_defects.pop('OK', None)

        # Save the filtered defects to the result dictionary
        result[filename] = filtered_defects

    return result


async def start_YOLO_inference(manifest: InferenceManifest, hyperparameters: Hyperparameters):
    model_uuid = manifest.model_uuid

    await preload_images(manifest)

    resize_images(os.path.join(os.getenv('DATASET_DIR'), 'source'), hyperparameters['target_image_size'], hyperparameters['target_image_size'])

    path_to_save = os.path.join(os.getenv('DATASET_DIR'))

    model_blob_name = model_uuid + '.pt'

    await download_model_file(model_blob_name, model_blob_name, os.getenv('DATASET_DIR'))
    model_path = os.path.join(path_to_save, model_blob_name)

    model = YOLO(model_path)

    # Define the directory paths
    test_images_dir = os.path.join(os.getenv('DATASET_DIR'), 'source')

    results_dir = os.path.join(os.getenv('DATASET_DIR'), 'results', 'predictions')

    # Ensure the results directory exists
    os.makedirs(results_dir, exist_ok=True)

    # Make predictions on the test images
    predicition_results = model.predict(
        source=test_images_dir, 
        project=os.path.join(os.getenv('DATASET_DIR'), 'results'), 
        name='predictions',
        
        save=True  # Save the predictions
    )
    
    # Process and filter the prediction results
    filtered_results = process_predictions(predicition_results, manifest.defects)


    # Print the results for each image
    for filename, defects in filtered_results.items():
        print(f"Image: {filename}")
        for defect, info in defects.items():
            print(f"  Defect: {defect}, Confidence: {info['confidence']}, BBox: {info['bbox']}")

    return {
        uuid_file: {
            defect_name: {
                'bbox': [float(x) for x in defect_detail['bbox']],
                'confidence': float(defect_detail['confidence']),
                'defect_class_id': int(defect_detail['defect_class_id'])
            }
            for defect_name, defect_detail in defect_info.items()
        }
        for uuid_file, defect_info in filtered_results.items()
    }
    


async def start_YOLO_training(model_uuid: str, hyperparameters: Hyperparameters):
    # selecting yolov8n model as base to fine-tune it
    model = YOLO('yolov8n.pt')  
    # enabling using of the GPU
    model.cuda()

    # Train the model
    model.train(
        project=os.path.join(os.getenv('DATASET_DIR'), 'results'), # path to result file
        data=os.path.join(os.getenv('DATASET_DIR'), 'dataset.yaml'),  # Path to the data configuration file
        epochs=hyperparameters['epochs'],  # Number of training epochs
        imgsz=hyperparameters['target_image_size'],  # Image size
        lr0=0.001
    )

    best_model_path = os.path.join(os.getenv('DATASET_DIR'), 'results', 'train', 'weights' , 'best.pt')

    model_blob_name = model_uuid + '.pt'

    upload_model(model_blob_name, best_model_path)

    return model_blob_name

