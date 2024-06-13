# from interfaces.index import TrainingManifest
from typing import Sequence
import yaml
import os
import numpy as np
import cv2

# from azure_adapter import upload_model
# from tensorflow import keras
import tensorflow as tf
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten
# from tensorflow.keras.utils import to_categorical
# from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# async def start_KERAS_inference():

async def start_KERAS_trainig():
    # Path to your dataset
    dataset_dir = os.getenv('DATASET_DIR')
    train_images_dir = os.path.join(dataset_dir, 'images/train')
    val_images_dir = os.path.join(dataset_dir, 'images/val')

    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    val_datagen = ImageDataGenerator(rescale=1./255)

    # Load images and labels
    train_generator = train_datagen.flow_from_directory(
        train_images_dir,
        target_size=(512, 512),
        batch_size=32,
        class_mode='sparse'
    )

    val_generator = val_datagen.flow_from_directory(
        val_images_dir,
        target_size=(512, 512),
        batch_size=32,
        class_mode='sparse'
    )

    # Model creation (example with MobileNetV2)
    base_model = tf.keras.applications.MobileNetV2(input_shape=(512, 512, 3), include_top=False, weights='imagenet')
    base_model.trainable = False  # Freeze the base model

    # Add custom top layers
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(1024, activation='relu'),
        tf.keras.layers.Dense(len(train_generator.class_indices), activation='softmax')  # Number of classes
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # Callbacks
    checkpoint_cb = ModelCheckpoint('best_model.h5', save_best_only=True)
    early_stopping_cb = EarlyStopping(patience=10, restore_best_weights=True)

    # Training
    history = model.fit(
        train_generator,
        epochs=50,
        validation_data=val_generator,
        callbacks=[checkpoint_cb, early_stopping_cb]
    )

# def save_yaml_file(defect_ids: Sequence[int]):
#     config_data = {
#         'path': os.getenv('DATASET_DIR'),
#         'train': 'images/train',
#         'val': 'images/val',
#         'nc': len(defect_ids),  # number of classes
#         'names': defect_ids  # class names
#     }

#     yaml_filepath = os.path.join( os.getenv('DATASET_DIR'), "dataset.yaml" )

#     with open(yaml_filepath, 'w+') as file:
#         yaml.dump(config_data, file, default_flow_style=False)

# async def prepare_keras_dataset(manifest: Manifest):
    
#     images = manifest.images.items()

#     for image in images:
#         file_uuid, filename = image
    
#         label_file_path = os.path.join(os.getenv('DATASET_DIR'), "labels")
#         image_file_path = os.path.join(os.getenv('DATASET_DIR'), "images")

#         if not os.path.exists(label_file_path):
#             os.makedirs(label_file_path)

#         if not os.path.exists(image_file_path):
#             os.makedirs(image_file_path)

#         await download_image_and_save_locally(filename, file_uuid, image_file_path)
        
#         with open(f"{label_file_path}/{file_uuid}.txt", 'w+') as file:
#             image_label_data = manifest.labels[file_uuid].label_data

#             file.write(image_label_data)

#         save_yaml_file(manifest.defect)
