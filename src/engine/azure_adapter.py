from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import os
import io
from PIL import Image

load_dotenv()

# Azure Blob Storage connection details
CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME") or "default"

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
    try:
        if not os.path.exists(target_save_path):
            os.makedirs(target_save_path)

        try:
            blob_client = container_client.get_blob_client(blob_name)
            download_stream = blob_client.download_blob()
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"An error occurred while downloading the blob: {e}")
        
        # Read blob content into a BytesIO buffer
        image_stream = io.BytesIO()
        download_stream.readinto(image_stream)
        image_stream.seek(0)  # Reset stream position

        # Save the image locally
        with open(os.path.join(target_save_path, name_to_save), 'wb') as file:
            file.write(image_stream.getbuffer())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occur during image download: {e}")

async def upload_model(blob_name: str, model_path: str):
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(model_path, "rb") as data:
            await blob_client.upload_blob(data, overwrite=True)

        print(f"Training model uploaded to blob storage successfully.")
    except Exception as ex:
        print(f"Error: {ex}")

async def download_model_file(
    blob_name: str, 
    name_to_save: str,
    target_save_path: str,
):
    if not os.path.exists(target_save_path):
        os.makedirs(target_save_path)
    
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(os.path.join(target_save_path, name_to_save), "wb") as model_file:
            stream = blob_client.download_blob()
            print('after stream', stream)
            data = stream.readall()
            print('after readall')

            model_file.write(data)

        print(f"Model {blob_name} downloaded successfully to {target_save_path}.")
    except Exception as e:
        print(f"An error occurred during download of the model: {e}")