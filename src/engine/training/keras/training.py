import os
import numpy as np
from azure_adapter import upload_model, download_model_file
from training.YOLOv8.training import process_predictions, preload_images

import tensorflow as tf

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import load_model

def build_model(num_classes, learning_rate):
    base_model = MobileNetV2(weights='imagenet', include_top=False)
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)

    for layer in base_model.layers:
        layer.trainable = False

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='categorical_crossentropy', metrics=['accuracy'])
    return model

async def start_KERAS_trainig(model_uuid, hyperparameters):

    dataset_dir = os.getenv('DATASET_DIR')
    train_dir = os.path.join(dataset_dir, 'images/train_processed')
    val_dir = os.path.join(dataset_dir, 'images/val_processed')

    train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

    target_image_size = hyperparameters['target_image_size']

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(target_image_size, target_image_size),
        batch_size=hyperparameters['batch_size'],
        class_mode='categorical'
    )

    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(target_image_size, target_image_size),
        batch_size=hyperparameters['batch_size'],
        class_mode='categorical'
    )

    model = build_model(num_classes=train_generator.num_classes, learning_rate=0.001)

    model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // train_generator.batch_size,
        epochs=hyperparameters['epochs'],
        validation_data=val_generator,
        validation_steps=val_generator.samples // val_generator.batch_size
    )

    model_path = os.path.join(os.getenv('DATASET_DIR'), f"{model_uuid}.keras")
    model.save(model_path)

    upload_model(f"{model_uuid}.keras", model_path)
    return f"{model_uuid}.keras"

async def start_KERAS_inference(manifest):
    model_uuid = manifest.model_uuid
    await preload_images(manifest)

    path_to_save = os.path.join(os.getenv('DATASET_DIR'))

    model_blob_name = model_uuid + '.keras'

    await download_model_file(model_blob_name, model_blob_name, os.getenv('DATASET_DIR'))

    model_path = os.path.join(path_to_save, model_blob_name)
    model = load_model(model_path)

    image_dir = os.path.join(os.getenv('DATASET_DIR'), 'source')
    image_paths = [os.path.join(image_dir, img) for img in os.listdir(image_dir) if img.lower().endswith(('.png', '.jpg', '.jpeg'))]

    results = []
    for image_path in image_paths:
        image = tf.keras.preprocessing.image.load_img(image_path, target_size=(224, 224))
        image_array = tf.keras.preprocessing.image.img_to_array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        predictions = model.predict(image_array)
        predicted_class = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class]

        results.append({
            "path": image_path,
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    filtered_results = process_predictions(results, manifest.defects)

    return filtered_results