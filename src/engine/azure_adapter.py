from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import os
import io
import logging
from PIL import Image

load_dotenv()

# Azure Blob Storage connection details
CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME") or "default"

azure_logger = logging.getLogger('azure')
azure_logger.setLevel(logging.WARNING)

# Set up custom logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize BlobServiceClient
blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)


def get_blob_name(
    fileName: str, 
    fileUuid: str
): 
    return f"{fileName}_{fileUuid}"

async def download_file_and_save(
    blob_name: str, 
    name_to_save: str,
    target_save_path: str,
):

    if not os.path.exists(target_save_path):
        os.makedirs(target_save_path)

    try:
        blob_client = container_client.get_blob_client(blob_name)
        download_stream = blob_client.download_blob()
        # Read blob content into a BytesIO buffer
        image_stream = io.BytesIO()
        download_stream.readinto(image_stream)
        image_stream.seek(0)  # Reset stream position
        logger.info(f"Downloaded blob: {blob_name}")
    except Exception as e:
        logger.error(f"An error occurred while downloading the blob: {e}")
        raise HTTPException(status_code=404, detail=f"An error occurred while downloading the blob: {e}")

    try:
        

        # Save the image locally
            with open(os.path.join(target_save_path, name_to_save), 'wb') as file:
                file.write(image_stream.getbuffer())
            
            logger.info(f"Image has been successfully downloaded and saved locally: {name_to_save}")

    except Exception as e:
        logger.error(f"An error occurred while saving the image locally: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while saving the image locally: {e}")
        
def upload_model(blob_name: str, model_path: str):
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(model_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)

        logger.info(f"Model {blob_name} uploaded successfully.")
    except Exception as ex:
        logger.error(f"An error occurred during upload of the model: {ex}")
        raise HTTPException(status_code=500, detail=f"An error occurred during upload of the model: {ex}")

async def download_model_file(
    blob_name: str, 
    name_to_save: str,
    target_save_path: str,
):
    if os.path.exists(os.path.join(target_save_path, name_to_save)):
        logger.info(f"Model {name_to_save} already exists in {target_save_path}. Skipping download.")
        return

    if not os.path.exists(target_save_path):
        os.makedirs(target_save_path)
    
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(os.path.join(target_save_path, name_to_save), "wb") as model_file:
            stream = blob_client.download_blob()
            data = stream.readall()
            model_file.write(data)

        logger.info(f"Model {name_to_save} downloaded successfully.")
    except Exception as e:
        logger.error(f"An error occurred during download of the model: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during download of the model: {e}")