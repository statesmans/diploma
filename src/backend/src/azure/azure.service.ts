
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob'; 
import { Injectable } from '@nestjs/common'; 
import { ConfigService } from 'src/config/config.service';
import { ImageService } from 'src/image/image.service';
import { uuid } from 'uuidv4'; 

@Injectable() export class AzureService { 
    private containerName: string;
    private blobInstance: BlobServiceClient;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.blobInstance = BlobServiceClient.fromConnectionString( this.configService.azure.connectionString );
        this.containerName = this.configService.azure.containerName || 'default';
    } 

	private getBlobClient(blobName: string): BlockBlobClient {
		const containerClient = this.blobInstance.getContainerClient(this.containerName);

		const blockBlobClient = containerClient.getBlockBlobClient(blobName); 

		return blockBlobClient; 
	} 
    
    async uploadFile(
        buffer: Buffer,
        azureBlobname: string
    ): Promise<void> {
        try {    
            const blockBlobClient = this.getBlobClient(azureBlobname);
    
            await blockBlobClient.uploadData(buffer);

        } catch(e) {
            throw new Error(e)
        }
    }

    async createAzureFileStream(
        azureBlobname: string
    ): Promise<NodeJS.ReadableStream> {
        const blockBlobClient = this.getBlobClient(azureBlobname);

        const blob = await blockBlobClient.download(undefined, undefined, { maxRetryRequests: 10 });

        return blob.readableStreamBody;
    }

    async deleteFile(
        azureBlobName: string
    ): Promise<void> {
        const blockBlobClient = this.getBlobClient(azureBlobName);

        await blockBlobClient.deleteIfExists();
    }

    getAzureFilename(
        filename: string,
        fileUuid: string,
    ) {

        return`${filename}_${fileUuid}`;
    }
} 