from fastapi import FastAPI, HTTPException
import os
import shutil
from interfaces.index import InferenceManifest, TrainingManifest, Hyperparameters
from training.YOLOv8.training import prepare_YOLO_dataset, start_YOLO_training, start_YOLO_inference
from training.keras.training import start_KERAS_trainig

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing import image

app = FastAPI()

dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')
os.environ['DATASET_DIR'] = dataset_dir

@app.post("/predict")
async def download_image(manifest: InferenceManifest,  hyperparameters: Hyperparameters):    
    try:
        fine_tune_YOLOv8 = hyperparameters
        print('before inferecne', manifest, hyperparameters, type(manifest), type(hyperparameters))
        # print(fine_tune_YOLOv8)
        # if fine_tune_YOLOv8:
        await start_YOLO_inference(manifest)
        # else:
            # await start_KERAS_trainig()
        if os.path.exists(os.getenv('DATASET_DIR')):
            shutil.rmtree(os.getenv('DATASET_DIR'))
    except Exception as e:
        if os.path.exists(os.getenv('DATASET_DIR')):
            shutil.rmtree(os.getenv('DATASET_DIR'))
        raise HTTPException(status_code=500, detail=f"An error occur during downloading of the dataset: {e}")

@app.post("/training")
async def download_image(manifest: TrainingManifest, hyperparameters: Hyperparameters):
    
    try:
        
        fine_tune_YOLOv8 = hyperparameters
        await prepare_YOLO_dataset(manifest)

        # print(fine_tune_YOLOv8)
        if fine_tune_YOLOv8:   
            return await start_YOLO_training(manifest.model_uuid)
        else:
            await start_KERAS_trainig()
        
        if os.path.exists(os.getenv('DATASET_DIR')):
            shutil.rmtree(os.getenv('DATASET_DIR'))

    except Exception as e:
        if os.path.exists(os.getenv('DATASET_DIR')):
            shutil.rmtree(os.getenv('DATASET_DIR'))
        raise HTTPException(status_code=500, detail=f"An error occur during downloading of the dataset: {e}")

# Function to preprocess the image
def preprocess_image(img_path, target_size=(512, 512)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize the image
    return img_array

# Function to decode predictions (example for classification)
def decode_predictions(preds, class_indices):
    predicted_class_index = np.argmax(preds, axis=1)
    predicted_confidence = np.max(preds, axis=1)
    class_labels = {v: k for k, v in class_indices.items()}
    predicted_class_label = class_labels[predicted_class_index[0]]
    return predicted_class_label, predicted_confidence[0]

# Function to process a directory of images
def predict_on_directory(model, img_dir, class_indices, target_size=(512, 512)):
    results = []
    
    for img_name in os.listdir(img_dir):
        img_path = os.path.join(img_dir, img_name)
        if img_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_array = preprocess_image(img_path, target_size)
            predictions = model.predict(img_array)
            predicted_label, confidence = decode_predictions(predictions, class_indices)
            results.append((img_name, predicted_label, confidence))
            print(f'Predicted: {predicted_label} with confidence: {confidence:.2f}, for image: {img_name}')
            # Display the image and prediction
            original_img = image.load_img(img_path)
            plt.imshow(original_img)
            plt.title(f'Predicted: {predicted_label} ({confidence:.2f})')
            plt.axis('off')
            plt.show()
    
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
    # from tensorflow.keras.preprocessing.image import ImageDataGenerator
    # import tensorflow as tf
    # import cv2
    # gpus = tf.config.experimental.list_physical_devices('GPU')
    # print(gpus)
    # if gpus:
    #     try:
    #         for gpu in gpus:
    #             tf.config.experimental.set_memory_growth(gpu, True)
    #     except RuntimeError as e:
    #         print(e)
    # dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

    # train_images_dir = os.path.join(dataset_dir, 'images/train_processed')
    # val_images_dir = os.path.join(dataset_dir, 'images/val_processed')

    # train_datagen = ImageDataGenerator(
    #     rescale=1./255,
    #     rotation_range=20,
    #     width_shift_range=0.2,
    #     height_shift_range=0.2,
    #     shear_range=0.2,
    #     zoom_range=0.2,
    #     horizontal_flip=True,
    #     fill_mode='nearest'
    # )

    # val_datagen = ImageDataGenerator(rescale=1./255)

    # # Load images and labels
    # train_generator = train_datagen.flow_from_directory(
    #     train_images_dir,
    #     target_size=(512, 512),
    #     batch_size=32,
    #     class_mode='sparse'
    # )

    # val_generator = val_datagen.flow_from_directory(
    #     val_images_dir,
    #     target_size=(512, 512),
    #     batch_size=32,
    #     class_mode='sparse'
    # )

    # # Model creation (example with MobileNetV2)
    # base_model = tf.keras.applications.MobileNetV2(input_shape=(512, 512, 3), include_top=False, weights='imagenet')
    # base_model.trainable = False  # Freeze the base model

    # # Add custom top layers
    # model = tf.keras.Sequential([
    #     base_model,
    #     tf.keras.layers.GlobalAveragePooling2D(),
    #     tf.keras.layers.Dense(1024, activation='relu'),
    #     tf.keras.layers.Dense(len(train_generator.class_indices), activation='softmax')  # Number of classes
    # ])

    # model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # # Callbacks
    # checkpoint_cb = ModelCheckpoint(os.path.join(dataset_dir, 'best_model.keras'), save_best_only=True)
    # early_stopping_cb = EarlyStopping(patience=10, restore_best_weights=True)

    # # Training
    # history = model.fit(
    #     train_generator,
    #     epochs=50,
    #     validation_data=val_generator,
    #     callbacks=[checkpoint_cb, early_stopping_cb]
    # )

    # model = tf.keras.models.load_model(os.path.join(dataset_dir, 'best_model.keras'))

    # # Directory of images to predict
    # img_dir = os.path.join(dataset_dir, 'test')

    # # Assuming class_indices are available from the data generator
    # class_indices = train_generator.class_indices

    # entries = os.listdir(img_dir)
    # # Filter out only files (not directories)
    # files = [entry for entry in entries if os.path.isfile(os.path.join(img_dir, entry))]
    # print(files[0])
    # # Predict on the directory of images
    # results = predict_on_directory(model, img_dir, class_indices)
    # print(results)
