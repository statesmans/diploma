# import torch
# import tensorflow as tf

# import os
# import numpy as np
# import keras
# from keras import layers
# from keras import ops


# print("dfvdfvdfv")
# # inputs = keras.Input(shape=(784,), name="digits")
# # x = layers.Dense(64, activation="relu", name="dense_1")(inputs)
# # x = layers.Dense(64, activation="relu", name="dense_2")(x)
# # outputs = layers.Dense(10, activation="softmax", name="predictions")(x)

# # model = keras.Model(inputs=inputs, outputs=outputs)

# (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

# # Preprocess the data (these are NumPy arrays)
# x_train = x_train.reshape(60000, 784).astype("float32") / 255
# x_test = x_test.reshape(10000, 784).astype("float32") / 255

# y_train = y_train.astype("float32")
# y_test = y_test.astype("float32")

# # Reserve 10,000 samples for validation
# x_val = x_train[-10000:]
# y_val = y_train[-10000:]
# x_train = x_train[:-10000]
# y_train = y_train[:-10000]

# def get_uncompiled_model():
#     inputs = keras.Input(shape=(784,), name="digits")
#     x = layers.Dense(64, activation="relu", name="dense_1")(inputs)
#     x = layers.Dense(64, activation="relu", name="dense_2")(x)
#     outputs = layers.Dense(10, activation="softmax", name="predictions")(x)
#     model = keras.Model(inputs=inputs, outputs=outputs)
#     return model


# def get_compiled_model():
#     model = get_uncompiled_model()
#     model.compile(
#         optimizer="rmsprop",
#         loss="sparse_categorical_crossentropy",
#         metrics=["sparse_categorical_accuracy"],
#     )
#     return model

# class CategoricalTruePositives(keras.metrics.Metric):
#     def __init__(self, name="categorical_true_positives", **kwargs):
#         super().__init__(name=name, **kwargs)
#         self.true_positives = self.add_variable(
#             shape=(), name="ctp", initializer="zeros"
#         )

#     def update_state(self, y_true, y_pred, sample_weight=None):
#         y_pred = ops.reshape(ops.argmax(y_pred, axis=1), (-1, 1))
#         values = ops.cast(y_true, "int32") == ops.cast(y_pred, "int32")
#         values = ops.cast(values, "float32")
#         if sample_weight is not None:
#             sample_weight = ops.cast(sample_weight, "float32")
#             values = ops.multiply(values, sample_weight)
#         self.true_positives.assign_add(ops.sum(values))

#     def result(self):
#         return self.true_positives.value

#     def reset_state(self):
#         # The state of the metric will be reset at the start of each epoch.
#         self.true_positives.assign(0.0)


# model = get_uncompiled_model()
# model.compile(
#     optimizer=keras.optimizers.RMSprop(learning_rate=1e-3),
#     loss=keras.losses.SparseCategoricalCrossentropy(),
#     metrics=[CategoricalTruePositives()],
# )
# model.fit(x_train, y_train, batch_size=64, epochs=3)

# import os
# import numpy as np
# import tensorflow as tf
from abstract.abstract_training import TrainingEngine
from azure_adapter import download_image_and_save_locally
from interfaces.index import Manifest
from typing import Sequence
import yaml
import os
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout

# # Typical dimensions might be 150x150 pixels or 224x224 pixels,
# base_dir = os.getenv('DATASET_URL')
# train_dir = os.path.join(base_dir, 'train')
# validation_dir = os.path.join(base_dir, 'validation')

# # gpus = tf.config.experimental.list_physical_devices('GPU')
# # if gpus:
# #     try:
# #         for gpu in gpus:
# #             tf.config.experimental.set_memory_growth(gpu, True)
# #     except RuntimeError as e:
# #         print(e)

# train_datagen = ImageDataGenerator(
#     rescale=1./255,
#     rotation_range=40,
#     width_shift_range=0.2,
#     height_shift_range=0.2,
#     shear_range=0.2,
#     zoom_range=0.2,
#     horizontal_flip=True,
#     fill_mode='nearest'
# )
# validation_datagen = ImageDataGenerator(rescale=1./255)

# train_generator = train_datagen.flow_from_directory(
#     train_dir,
#     # target_size=(1600, 256),
#     target_size=(150, 150),

#     batch_size=100,
#     class_mode='binary'
# )

# validation_generator = validation_datagen.flow_from_directory(
#     validation_dir,
#     target_size=(150, 150),
#     # target_size=(1600, 256),

#     batch_size=100,
#     class_mode='binary'
# )

# model = Sequential([
#     Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
#     MaxPooling2D(2, 2),
#     Conv2D(64, (3, 3), activation='relu'),
#     MaxPooling2D(2, 2),
#     Conv2D(128, (3, 3), activation='relu'),
#     MaxPooling2D(2, 2),
#     Flatten(),
#     Dense(512, activation='relu'),
#     Dropout(0.5),
#     Dense(1, activation='sigmoid')
# ])

# model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# history = model.fit(
#     train_generator,
#     steps_per_epoch=500,
#     batch_size=100,
#     epochs=500,
#     validation_data=validation_generator,
#     validation_steps=500
# )

# model.save('defect_detection_model.h5')

# class KerasTraining(TrainingEngine):
#     def start_training(self):
#         print()

#     async def prepare_dataset(self, images):
#         print()

async def start_trainig():
    base_dir = 'dataset'
    image_dirs = {
        'train': os.path.join(base_dir, 'images/train'),
        'val': os.path.join(base_dir, 'images/val')
    }
    label_dirs = {
        'train': os.path.join(base_dir, 'labels/train'),
        'val': os.path.join(base_dir, 'labels/val')
    }

    def load_images_and_labels(image_dir, label_dir):
        images = []
        labels = []
        for image_name in os.listdir(image_dir):
            image_path = os.path.join(image_dir, image_name)
            label_path = os.path.join(label_dir, os.path.splitext(image_name)[0] + '.txt')

            image = cv2.imread(image_path)
            image = cv2.resize(image, (224, 224))
            images.append(image)

            with open(label_path, 'r') as file:
                yolo_label = file.read().strip().split()
                labels.append([int(yolo_label[0]), float(yolo_label[1]), float(yolo_label[2]), float(yolo_label[3]), float(yolo_label[4])])
        
        return np.array(images), np.array(labels)

    x_train, y_train = load_images_and_labels(image_dirs['train'], label_dirs['train'])
    x_val, y_val = load_images_and_labels(image_dirs['val'], label_dirs['val'])

    # Normalize images
    x_train = x_train / 255.0
    x_val = x_val / 255.0

    # Define a simple CNN model
    def create_model():
        model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            MaxPooling2D((2, 2)),
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D((2, 2)),
            Flatten(),
            Dense(64, activation='relu'),
            Dense(5)  # Number of output neurons should match the number of label elements
        ])
        model.compile(optimizer='adam', loss='mse', metrics=['accuracy'])
        return model

    # Cross-validation
    kf = KFold(n_splits=5)

    for train_index, val_index in kf.split(x_train):
        x_train_fold, x_val_fold = x_train[train_index], x_train[val_index]
        y_train_fold, y_val_fold = y_train[train_index], y_train[val_index]

        model = create_model()
        model.fit(x_train_fold, y_train_fold, validation_data=(x_val_fold, y_val_fold), epochs=10, batch_size=32)

    # Save the trained model
    model.save('trained_model.h5')

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

async def prepare_keras_dataset(manifest: Manifest):
    
    images = manifest.images.items()

    for image in images:
        file_uuid, filename = image
    
        label_file_path = os.path.join(os.getenv('DATASET_DIR'), "labels")
        image_file_path = os.path.join(os.getenv('DATASET_DIR'), "images")

        if not os.path.exists(label_file_path):
            os.makedirs(label_file_path)

        if not os.path.exists(image_file_path):
            os.makedirs(image_file_path)

        await download_image_and_save_locally(filename, file_uuid, image_file_path)
        
        with open(f"{label_file_path}/{file_uuid}.txt", 'w+') as file:
            image_label_data = manifest.labels[file_uuid].label_data

            file.write(image_label_data)

        save_yaml_file(manifest.defect)
