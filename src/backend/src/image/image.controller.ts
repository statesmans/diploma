import { Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageEntity } from './image.entity';
import { ImageService } from './image.service';
import { ImageQueryDto } from './dto/image-query.dto';
import { IPaginated } from 'src/interfaces';

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
        @Param('imageSetId') imageSetId: number,
        @Query() query: ImageQueryDto,
    ): Promise<IPaginated<ImageEntity>> {
        const images = await this.imageService.findAllByImageSetId(imageSetId, query);
        return images;
    }

    
}
