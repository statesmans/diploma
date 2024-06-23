from fastapi import FastAPI, HTTPException
import os
import shutil
from interfaces.index import InferenceManifest, TrainingManifest, Hyperparameters, merge_hyperparameters
from training.YOLOv8.training import prepare_dataset, start_YOLO_training, start_YOLO_inference
from training.keras.training import start_KERAS_trainig, start_KERAS_inference
import tensorflow as tf
from typing import Optional

app = FastAPI()

dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')
os.environ['DATASET_DIR'] = dataset_dir

def clear_dataset_dir():
    if os.path.exists(os.getenv('DATASET_DIR')):
        shutil.rmtree(os.getenv('DATASET_DIR'))

@app.post("/predict")
async def download_image(manifest: InferenceManifest,  hyperparameters: Optional[Hyperparameters] = None):    
    try:
        if hyperparameters is None:
            hyperparameters = Hyperparameters()

        hyperparameters = merge_hyperparameters(hyperparameters)
 
        if hyperparameters['fine_tune_YOLOv8'] == 1:
            result = await start_YOLO_inference(manifest, hyperparameters)
        else:
            result = await start_KERAS_inference(manifest, hyperparameters)
        
        clear_dataset_dir()

        return result  
    except Exception as e:
        clear_dataset_dir()
        raise HTTPException(status_code=500, detail=f"An error occur during inference: {e}")

@app.post("/training")
async def start_training(manifest: TrainingManifest, hyperparameters: Optional[Hyperparameters] = None):
    
    try:
        physical_devices = tf.config.list_physical_devices('GPU')

        # Enable memory growth if GPUs are available
        if physical_devices:
            try:
                tf.config.experimental.set_memory_growth(physical_devices[0], True)
                print("Memory growth enabled")
            except RuntimeError as e:
                print("Error enabling memory growth:", e)

        if hyperparameters is None:
            hyperparameters = Hyperparameters()

        hyperparameters = merge_hyperparameters(hyperparameters)

        await prepare_dataset(manifest, hyperparameters)

        if hyperparameters['fine_tune_YOLOv8'] == 1:
            training_model_blob_name: str = await start_YOLO_training(manifest.model_uuid, hyperparameters)
        else:
            training_model_blob_name: str = await start_KERAS_trainig(manifest.model_uuid, hyperparameters, manifest.defects)
        
        clear_dataset_dir()

        return training_model_blob_name
    except Exception as e:
        clear_dataset_dir()
        raise HTTPException(status_code=500, detail=f"An error occur during training: {e}")

if __name__ == "__main__":
    import tensorflow as tf

    print("TensorFlow Version:", tf.__version__)

    cuda_version = tf.sysconfig.get_build_info().get('cuda_version', 'Not Available')
    print("CUDA Version:", cuda_version)

    cudnn_version = tf.sysconfig.get_build_info().get('cudnn_version', 'Not Available')
    print("cuDNN Version:", cudnn_version)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
