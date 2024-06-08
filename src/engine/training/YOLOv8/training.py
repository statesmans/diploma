from abstract.abstract_training import TrainingEngine
from azure_adapter import download_image_and_save_locally
from typing import Sequence
from interfaces.index import Manifest
from ultralytics import YOLO
from sklearn.model_selection import KFold

import yaml 
import os
import shutil

# Load a pre-trained YOLOv8 model
# model = YOLO('yolov8n.pt')  # You can choose 'yolov8n.pt', 'yolov8s.pt', etc. based on your needs

# path_to_dataset = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset/dataset.yml')
# # Fine-tune the model on your custom dataset
# model.train(data=path_to_dataset, epochs=100, imgsz=640)

# # Save the trained model
# model.save('yolov8_custom.pt')


# from ultralytics import YOLO

# # Load the fine-tuned model
# model = YOLO('yolov8_custom.pt')

# # Perform inference on a new image
# results = model('path/to/your/image.jpg')

# # Print the results
# results.print()

# # Save the result image
# results.save('path/to/save/result.jpg')

# # Or show the result image
# results.show()

# class YOLOTraining(TrainingEngine):
#     def start_training(self):
#         print()

#     async def prepare_dataset(self, manifest: Mano):
#         images = list(manifest.test.items()) + list(manifest.train.items())

#         for image in images:
#             file_uuid, filename = image
#             print(file_uuid, filename)
            


#             if file_uuid in manifest.train:
#                 label_file_path = os.path.join(os.getenv('DATASET_DIR'), "labels", "train")
#                 image_file_path = os.path.join(os.getenv('DATASET_DIR'), "images", "train")

#             elif file_uuid in manifest.test:
#                 label_file_path = os.path.join(os.getenv('DATASET_DIR'), "labels", "test")
#                 image_file_path = os.path.join(os.getenv('DATASET_DIR'), "images", "test")


#             if not os.path.exists(label_file_path):
#                 os.makedirs(label_file_path)

#             await download_image_and_save_locally(filename, file_uuid, image_file_path)
            
#             with open(f"{label_file_path}/{file_uuid}.txt", 'w+') as file:
                

#                 image_label_data = manifest.labels[file_uuid].label_data

#                 print(f"{image_label_data}, labels")
#                 file.write(image_label_data)
#             self.save_yaml_file(manifest.defect)
 
#     def save_yaml_file(self, defect_ids: Sequence[int]):
#         config_data = {
#             'path': self.dataset_dir,
#             'train': 'images/train',
#             'val': 'images/val',
#             'nc': len(defect_ids),  # number of classes
#             'names': defect_ids  # class names
#         }

#         yaml_filepath = os.path.join( self.dataset_dir, "dataset.yaml" )

#         with open(yaml_filepath, 'w+') as file:
#             yaml.dump(config_data, file, default_flow_style=False)

async def start_YOLO_training():

    # Define paths
    dataset_dir = os.getenv('DATASET_DIR')
    images_dir = os.path.join(dataset_dir, 'images')
    labels_dir = os.path.join(dataset_dir, 'labels')

    # Load image and label files
    image_files = sorted(os.listdir(images_dir))
    label_files = sorted(os.listdir(labels_dir))

    # Define the number of folds
    num_folds = 5 if len(image_files) >= 5 else len(image_files)
    kf = KFold(n_splits=num_folds)
    print('after KF')
    # Temporary directories for YOLOv8 training
    temp_train_images_dir = os.path.join(dataset_dir, 'images', 'temp_train')
    temp_val_images_dir = os.path.join(dataset_dir, 'images', 'temp_val')
    temp_train_labels_dir = os.path.join(dataset_dir, 'labels', 'temp_train')
    temp_val_labels_dir = os.path.join(dataset_dir, 'labels', 'temp_val')

    # Create temporary directories
    os.makedirs(temp_train_images_dir, exist_ok=True)
    os.makedirs(temp_val_images_dir, exist_ok=True)
    os.makedirs(temp_train_labels_dir, exist_ok=True)
    os.makedirs(temp_val_labels_dir, exist_ok=True)
    print('before for fold, ')

    for fold, (train_idx, val_idx) in enumerate(kf.split(image_files)):
        print('enter')
        # Clear temporary directories
        for dir_path in [temp_train_images_dir, temp_val_images_dir, temp_train_labels_dir, temp_val_labels_dir]:
            for file in os.listdir(dir_path):
                os.remove(os.path.join(dir_path, file))

        # Copy files to temporary directories
        for idx in train_idx:
            shutil.copy(os.path.join(images_dir, image_files[idx]), temp_train_images_dir)
            shutil.copy(os.path.join(labels_dir, label_files[idx]), temp_train_labels_dir)
        for idx in val_idx:
            shutil.copy(os.path.join(images_dir, image_files[idx]), temp_val_images_dir)
            shutil.copy(os.path.join(labels_dir, label_files[idx]), temp_val_labels_dir)

        # Define YOLOv8 data configuration for the current fold
        data_yaml = f"""
        train: {temp_train_images_dir}
        val: {temp_val_images_dir}

        nc: 1  # number of classes
        names: ['class0']
        """

        with open('data_fold.yaml', 'w') as file:
            file.write(data_yaml)

        # Load a YOLOv8 model (pretrained)
        model = YOLO('yolov8s.pt')  # Replace with your custom model if needed

        # Train the model
        model.train(data='data_fold.yaml', epochs=50, imgsz=640, project=f'yolov8_fold_{fold}')

    # Cleanup temporary directories
    shutil.rmtree(temp_train_images_dir)
    shutil.rmtree(temp_val_images_dir)
    shutil.rmtree(temp_train_labels_dir)
    shutil.rmtree(temp_val_labels_dir)

def save_yaml_file(defect_ids: Sequence[int]):
    config_data = {
        'path': os.getenv('DATASET_DIR'),
        'train': 'images/train',
        'val': 'images/val',
        'nc': len(defect_ids),  # number of classes
        'names': defect_ids  # class names
    }

    yaml_filepath = os.path.join( os.getenv('DATASET_DIR'), "dataset.yaml" )

    with open(yaml_filepath, 'w+') as file:
        yaml.dump(config_data, file, default_flow_style=False)

async def prepare_YOLO_dataset(manifest: Manifest):
    images = manifest.images.items()

    for image in images:
        file_uuid, filename = image
        print(file_uuid, filename)
        
        label_file_path = os.path.join(os.getenv('DATASET_DIR'), "labels")
        image_file_path = os.path.join(os.getenv('DATASET_DIR'), "images")



        if not os.path.exists(label_file_path):
            os.makedirs(label_file_path)

        width, height = await download_image_and_save_locally(filename, file_uuid, image_file_path)
        
        with open(f"{label_file_path}/{file_uuid}.txt", 'w+') as file:
            

            image_label_data = manifest.labels[file_uuid].label_data

            label_boundary = image_label_data.split(' ')
            integer_elements = [label_boundary[0]] + [float(element) for element in label_boundary[1:]]
            print(width, height)
            class_id = integer_elements[0]
            x_min = integer_elements[1]
            y_min = integer_elements[2]
            box_width = integer_elements[3]
            box_height = integer_elements[4]

            # Calculate center coordinates
            X_center = x_min + (box_width / 2.0)
            Y_center = y_min + (box_height / 2.0)

            # Normalize the center coordinates and dimensions
            X_center_norm = X_center / width
            Y_center_norm = Y_center / height
            width_norm = box_width / width
            height_norm = box_height / height

            # Return the YOLO format
            yolo_label = [class_id, X_center_norm, Y_center_norm, width_norm, height_norm]
            
            print(f"{yolo_label}, labels")
            file.write(f"{yolo_label}")

        save_yaml_file(manifest.defect_ids)

