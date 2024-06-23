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
import cv2

def build_model(num_classes, learning_rate):
    base_model = MobileNetV2(weights='imagenet', include_top=False)
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    predictions = Dense(num_classes, activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    for layer in base_model.layers:
        layer.trainable = False

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='binary_crossentropy', metrics=['accuracy'])
    return model

async def start_KERAS_trainig(model_uuid, hyperparameters, defect_classes):
    defect_classes_values = [value for key, value in defect_classes.items()]
     

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
        class_mode='categorical',
        classes=defect_classes_values
    )

    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(target_image_size, target_image_size),
        batch_size=hyperparameters['batch_size'],
        class_mode='categorical',
        classes=defect_classes_values
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

async def start_KERAS_inference(manifest, hyperparameters):
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
        image = tf.keras.preprocessing.image.load_img(image_path, target_size=(hyperparameters['target_image_size'], hyperparameters['target_image_size']))
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

def process_predictions(predictions, defect_mapping):
    result = {}
    for res in predictions:
        image_path = res['path']
        label = res['predicted_class']
        confidence = res['confidence']

        width, height = cv2.imread(image_path).shape[:2]

        # Get the filename from the image path
        filename = os.path.splitext(os.path.basename(image_path))[0]


        # Dictionary to store the highest confidence for each defect type
        defect_confidences = {defect: [] for defect in defect_mapping.values()}

        label_id = str(int(label) + 1)
        label_name = defect_mapping[label_id]
        defect_confidences[label_name].append((confidence, label_id))

        # Select the most confident labels for each defect
        filtered_defects = {}
        for defect, bbox_conf_list in defect_confidences.items():
            if bbox_conf_list:
                # Select the bounding box with the highest confidence for this defect
                best_confidence, label_id = max(bbox_conf_list, key=lambda x: x[1])
                filtered_defects[defect] = {
                    'bbox': [0, 0, width, height],
                    'confidence': best_confidence,
                    'defect_class_id': label_id
                }

        # If there is any defect other than 'ok', remove 'ok'
        if any(defect != 'OK' for defect in filtered_defects):
            filtered_defects.pop('OK', None)

        # Save the filtered defects to the result dictionary
        result[filename] = filtered_defects

    return result