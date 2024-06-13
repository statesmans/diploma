
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

	private async getBlobClient(imageName: string): Promise<BlockBlobClient> {
		const containerClient = this.blobInstance.getContainerClient(this.containerName);

		const blockBlobClient = containerClient.getBlockBlobClient(imageName); 

		return blockBlobClient; 
	} 
    
    async uploadFile(
        buffer: Buffer,
        uuidFile: string,
        filename: string,
    ): Promise<void> {
        try {
            const azureFilename = this.getAzureFilename(filename, uuidFile);
            console.log('upload', azureFilename)
    
            const blockBlobClient = await this.getBlobClient(azureFilename);
    
            await blockBlobClient.uploadData(buffer);

        } catch(e) {
            throw new Error(e)
        }
    }

    async createAzureFileStream(
        filename: string,
        uuidFile: string
    ): Promise<NodeJS.ReadableStream> {
        const azureFilename = this.getAzureFilename(filename, uuidFile);

        const blockBlobClient = await this.getBlobClient(azureFilename);

        const blob = await blockBlobClient.download(undefined, undefined, { maxRetryRequests: 10 });

        return blob.readableStreamBody;
    }

    async deleteFile(
        uuidFile: string,
        filename: string
    ): Promise<void> {
        const azureFilename = this.getAzureFilename(filename, uuidFile);
        const blockBlobClient = await this.getBlobClient(azureFilename);

        await blockBlobClient.deleteIfExists();
    }

    getAzureFilename(
        filename: string,
        fileUuid: string,
    ) {

        return`${filename}_${fileUuid}`;
    }
} 