from azure_adapter import download_file_and_save, upload_model, get_blob_name, download_model_file
from typing import Sequence
from interfaces.index import TrainingManifest, InferenceManifest
from ultralytics import YOLO

from PIL import Image
import albumentations as A
from sklearn.model_selection import train_test_split

from typing import Dict
import cv2
import yaml 
import os


def augment_and_process_image(image, bbox, target_size):
    print('input augment_and_process_image', bbox)



    transform = A.Compose([
        A.HorizontalFlip(p=0.5),
        A.RandomBrightnessContrast(p=0.2),
        A.Rotate(limit=10, p=0.5),
        A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.2, rotate_limit=10, p=0.5)
    ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
    print('after transform', bbox)
    
    # Apply augmentation
    print('before augmented', bbox)

    augmented = transform(image=image, bboxes=[bbox], class_labels=[0])
    image = augmented['image']
    bbox = augmented['bboxes'][0]
    print('after bbox = augmented[bboxes][0]', bbox)

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

def to_YOLO_format(
    label_data,
    filename,
    image_path,
):
    label_boundary = label_data.split(' ')
    integer_elements = [int(label_boundary[0])] + [float(element) for element in label_boundary[1:]]
    if len(integer_elements) != 5:
        raise ValueError(f"Label data should have 5 elements, but got {len(integer_elements)}")
    
    class_id, x_top_left, y_top_left, width_box, height_box = integer_elements

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
    print(f"{class_id} {x_center} {y_center} {yolo_width} {yolo_height}\n")
    # Write the YOLO formatted label to file
    return [class_id, x_center, y_center, yolo_width, yolo_height]


async def preload_images(manifest: TrainingManifest):
    images = manifest.images.items()
    


    for image in images:
        file_uuid, filename = image


        image_saving_filename = file_uuid + os.path.splitext(filename)[1]
        blob_name = get_blob_name(filename, file_uuid)
        # image_path = os.path.join(val_image_file_dir, image_saving_filename)
        test = os.path.join(os.getenv('DATASET_DIR'), 'source')
        print(blob_name + " " + test + " " + image_saving_filename) 
        await download_file_and_save(blob_name, image_saving_filename, test)


def prepare_and_save_label_and_image(
    image_path: str, 
    labels,
    defects,
    output_dir,
    target_size
):
    image_filename = os.path.splitext(os.path.basename(image_path))[0]
    print('before  image_label_data = labels[image_filename].label_data')

    image_label_data = labels[image_filename].label_data
    print('aftetrr  image_label_data = labels[image_filename].label_data', image_label_data)

    image_label_defect_id = str(labels[image_filename].defect_id)
    image_defect_name = defects.get(image_label_defect_id, 'unknown_defect')
    print('aftetrr  image_defect_name', image_path)

    image = cv2.imread(image_path)
    bbox_class_id, x_center, y_center, width_box, height_box = to_YOLO_format(image_label_data, image_filename, image_path)

    bbox = [x_center, y_center, width_box, height_box]

    processed_image, bbox = augment_and_process_image(image, bbox, target_size)
    
    print('image_path', image_path)
    print('bbox', bbox)
    output_image_path_dir = os.path.join(output_dir, image_defect_name)
    os.makedirs(output_image_path_dir, exist_ok=True)

    # print('output_path', output_image_path_dir, image.shape, image.shape, processed_image)
    cv2.imwrite(os.path.join(output_image_path_dir, os.path.basename(image_path)), processed_image)
    # cv2.imwrite(os.path.join(output_image_path_dir, os.path.basename(image_path)), image)


    label_output_path =  os.path.join(output_dir, image_defect_name).replace('images', 'labels')
    os.makedirs(label_output_path, exist_ok=True)
    file_name, file_extension = os.path.splitext(os.path.basename(image_path))

    # Replace extension with .txt
    label_file_name = file_name + '.txt'    

    print('before open')
    with open(os.path.join(label_output_path, label_file_name), 'w+') as label_file:
        print('after open')
        print(bbox)

        for idx, defect_class_id in enumerate(defects):
            if int(defect_class_id) == bbox_class_id:
                yolo_bbox = [idx] + bbox
                label_file.write(' '.join(map(str, yolo_bbox)))



async def prepare_YOLO_dataset(manifest: TrainingManifest):

    await preload_images(manifest)
    # Example usage
    dataset_dir = os.getenv('DATASET_DIR')
    image_dir = os.path.join(dataset_dir, 'source')
    image_paths = [os.path.join(image_dir, img) for img in os.listdir(image_dir) if img.endswith('.jpg')]

    target_size = (512, 512)
    train_output_dir = os.path.join(dataset_dir, 'images/train_processed')
    val_output_dir = os.path.join(dataset_dir, 'images/val_processed')

    os.makedirs(train_output_dir, exist_ok=True)
    os.makedirs(val_output_dir, exist_ok=True)

    labels = manifest.labels
    defects = manifest.defects

    train_images, val_images = train_test_split(image_paths, train_size=0.8, random_state=42)
    print(train_images, val_images)

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
    """
    Resizes all images in the specified directory to the given width and height.

    Parameters:
    directory_path (str): Path to the directory containing images.
    width (int): Desired width of the output images.
    height (int): Desired height of the output images.
    """
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
def process_predictions(predictions, model, defect_mapping):
    result = {}
    for res in predictions:
        image_path = res.path
        boxes = res.boxes.xyxy.cpu().numpy()  # Bounding boxes
        labels = res.boxes.cls.cpu().numpy()  # Class labels
        confidences = res.boxes.conf.cpu().numpy()  # Confidence scores

        # Get the filename from the image path
        filename = os.path.basename(image_path)

        if len(confidences) == 0:
            continue

        # Dictionary to store the highest confidence for each defect type
        defect_confidences = {defect: [] for defect in defect_mapping.values()}

        for box, label, confidence in zip(boxes, labels, confidences):
            label_name = defect_mapping[str(int(label))]
            if label_name in defect_confidences:
                defect_confidences[label_name].append((box, confidence))

        # Select the most confident labels for each defect
        filtered_defects = {}
        for defect, bbox_conf_list in defect_confidences.items():
            if bbox_conf_list:
                # Select the bounding box with the highest confidence for this defect
                best_bbox, best_confidence = max(bbox_conf_list, key=lambda x: x[1])
                filtered_defects[defect] = {
                    'bbox': best_bbox.tolist(),
                    'confidence': best_confidence
                }

        # If there is any defect other than 'ok', remove 'ok'
        if any(defect != 'ok' for defect in filtered_defects):
            filtered_defects.pop('ok', None)

        # Save the filtered defects to the result dictionary
        result[filename] = filtered_defects

    return result


async def start_YOLO_inference(manifest: InferenceManifest):
    model_uuid = manifest.model_uuid
    images = manifest.images.items()

    await preload_images(manifest)

    resize_images(os.path.join(os.getenv('DATASET_DIR'), 'source'), 512, 512)

    path_to_save = os.path.join(os.getenv('DATASET_DIR'))
    # print('before +', model_uuid)
    model_blob_name = model_uuid + '.pt'
    # print('before download_file_and_save')

    # await download_file_and_save(model_blob_name, model_blob_name, os.getenv('DATASET_DIR'))
    # await download_model_file(model_uuid, model_blob_name, os.getenv('DATASET_DIR'))
    model_path = os.path.join(os.getenv('DATASET_DIR'), 'results', 'train', 'weights', 'best.pt')
    # model_path = os.path.join(path_to_save, model_blob_name)

    # print('before init', model_path)
    model = YOLO(model_path)
    # print('after init')
    # Define the directory paths
    test_images_dir = os.path.join(os.getenv('DATASET_DIR'), 'source')

    results_dir = os.path.join(os.getenv('DATASET_DIR'), 'results', 'predictions')

    # Ensure the results directory exists
    os.makedirs(results_dir, exist_ok=True)
    # print('before predict')

    # Load the model
    # Make predictions on the test images
    predicition_results = model.predict(
        source=test_images_dir, 
        project=os.path.join(os.getenv('DATASET_DIR'), 'results'), 
        name='predictions',
        
        save=True  # Save the predictions
    )

   
    # Process and filter the prediction results
    filtered_results = process_predictions(predicition_results, model, defect_mapping)

    # Print the results for each image
    for filename, defects in filtered_results.items():
        print(f"Image: {filename}")
        for defect, info in defects.items():
            print(f"  Defect: {defect}, Confidence: {info['confidence']}, BBox: {info['bbox']}")

#     result = {}

#     # Process and save each prediction
#     for res in predicition_results:
#         image_path = res.path
        
#         boxes = res.boxes.xyxy.cpu().numpy()  # Bounding boxes
#         labels = res.boxes.cls.cpu().numpy()  # Class labels
#         confidences = res.boxes.conf.cpu().numpy()  # Confidence scores
        
#         # Get the filename from the image path
#         filename = os.path.basename(image_path)
#         print('confidences for filename: ', filename,' ',  confidences)
#         if len(confidences) == 0: 
#             return
#         # Find the index of the highest confidence score
#         max_confidence_idx = confidences.argmax()
        
#         # Get the bounding box and confidence with the highest score
#         best_bbox = boxes[max_confidence_idx]
#         best_confidence = confidences[max_confidence_idx]
        
#         # Convert numerical label to class name if needed
#         best_label_name = model.names[int(labels[max_confidence_idx])]
        
#         print('The best confidence: ', best_bbox, best_confidence, best_label_name)
#         print('All the confidences from image: ', confidences)


#         # Save to the result dictionary
#         result[filename] = {
#             'bbox': best_bbox.tolist(),
#             'confidence': best_confidence,
#             'label': best_label_name
#         }

# # Print or use the result dictionary as needed
#     print(result)


async def start_YOLO_training(model_uuid: str):
    # selecting yolov8n model as base to fine-tune it
    model = YOLO('yolov8n.pt')  
    # enabling using of the GPU
    model.cuda()

    # Train the model
    model.train(
        project=os.path.join(os.getenv('DATASET_DIR'), 'results'), # path to result file
        data=os.path.join(os.getenv('DATASET_DIR'), 'dataset.yaml'),  # Path to the data configuration file
        epochs=200,  # Number of training epochs
        imgsz=512,  # Image size
        lr0=0.001
    )

    best_model_path = os.path.join(os.getenv('DATASET_DIR'), 'results', 'weights' , f'best.pt')

    model_blob_name = model_uuid + '.pt'

    # model.save(path_to_save)

    await upload_model(model_blob_name, best_model_path)


    return model_blob_name
  

# def crop_and_pad_image(image_path, label, target_size=512, padding_color=(128, 128, 128)):
#     # Load the image
#     image = cv2.imread(image_path)
#     height, width, _ = image.shape
#     print(label, image.size, height, width)
#     # Parse the YOLO label
#     # class_id, x_center, y_center, w, h = map(float, label.strip().split())

#     # # Convert YOLO format to bounding box coordinates
#     # x_center, y_center, w, h = x_center * width, y_center * height, w * width, h * height
#     # x1, y1 = int(x_center - w / 2), int(y_center - h / 2)
#     # x2, y2 = int(x_center + w / 2), int(y_center + h / 2)

#     # # Ensure the coordinates are within the image bounds
#     # x1 = max(0, x1)
#     # y1 = max(0, y1)
#     # x2 = min(width, x2)
#     # y2 = min(height, y2)

#     # print(f"Bounding box coordinates - x1: {x1}, y1: {y1}, x2: {x2}, y2: {y2}")
#     defect_id, top_left_x, top_left_y, label_width, label_height = label
#     print(top_left_x, top_left_y, label_width, label_height )
#     x1, y1 = int(top_left_x), int(top_left_y)
#     x2, y2 = int(top_left_x + label_width), int(top_left_y + label_height)
    
#     # Crop the image using the bounding box
#     cropped_image = image[y1:y2, x1:x2]

#     # Resize the cropped image to the target size
#     resized_image = cv2.resize(cropped_image, (target_size, target_size))

#     # Calculate padding
#     pad_top = (target_size - resized_image.shape[0]) // 2
#     pad_bottom = target_size - resized_image.shape[0] - pad_top
#     pad_left = (target_size - resized_image.shape[1]) // 2
#     pad_right = target_size - resized_image.shape[1] - pad_left

#     # Add padding to the resized image
#     padded_image = cv2.copyMakeBorder(
#         resized_image, pad_top, pad_bottom, pad_left, pad_right,
#         cv2.BORDER_CONSTANT, value=padding_color
#     )

#     return padded_image
