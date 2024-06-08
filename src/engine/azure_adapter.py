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

async def download_image_and_save_locally(
    file_name: str, 
    file_uuid: str,
    target_save_path: str
):
    try:
        if not os.path.exists(target_save_path):
            os.makedirs(target_save_path)

        try:
            blob_client = container_client.get_blob_client(get_blob_name(file_name, file_uuid))
            download_stream = blob_client.download_blob()
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"An error occurred while downloading the blob: {e}")
        
        # Read blob content into a BytesIO buffer
        image_stream = io.BytesIO()
        download_stream.readinto(image_stream)
        image_stream.seek(0)  # Reset stream position

        filename_to_save = file_uuid + os.path.splitext(file_name)[1]

        # Save the image locally
        with open(os.path.join(target_save_path, filename_to_save), 'wb') as file:
            file.write(image_stream.getbuffer())

        image = Image.open(os.path.join(target_save_path, filename_to_save))
        
        return image.size
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occur during image download: {e}")
