import { Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { DataResponse, asResponse } from 'src/lib/data-response';
import { ImageEntity } from './image.entity';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {

    constructor(
        private readonly imageService: ImageService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @UploadedFile() image: Express.Multer.File,
        @Query('imageSetId') imageSetId: string,
    ): Promise<ImageEntity | null> {
        const id = await this.imageService.uploadImage(
            image,
            +imageSetId,
        );

        const data = await this.imageService.findOne(id);

        return data;
    }

    @Get(':imageSetId')
    async getAll(
        @Param('imageSetId') imageSetId: number
    ): Promise<ImageEntity[]> {
        const images = await this.imageService.findAllByImageSetId(imageSetId);
        return images;
    }
}
