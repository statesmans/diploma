from fastapi import FastAPI, HTTPException
import json
from azure_adapter import download_image_and_save_locally
import asyncio
import os
import itertools
import shutil
from interfaces.index import Manifest, Hyperparameters
# from training.keras.training import prepare_keras_dataset
from training.YOLOv8.training import prepare_YOLO_dataset, start_YOLO_training

import yaml

app = FastAPI()

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

os.environ['BASE_DIR'] = base_dir
os.environ['DATASET_DIR'] = dataset_dir

@app.post("/training")
async def download_image(manifest: Manifest, hyperparameters: Hyperparameters):
    print('after')
    # manifest, hyperparameters = body
    # fine_tune_YOLOv8 = hyperparameters
    
    try:
        
        # print(fine_tune_YOLOv8)
        # if fine_tune_YOLOv8:
            
        await prepare_YOLO_dataset(manifest)
        # else:
        #     await prepare_keras_dataset(manifest)
        
        # await start_YOLO_training()

    except Exception as e:
        if os.path.exists(os.getenv('DATASET_DIR')):
            shutil.rmtree(os.getenv('DATASET_DIR'))
        raise HTTPException(status_code=500, detail=f"An error occur during downloading of the dataset: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # asyncio.run(main())