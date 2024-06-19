import { Controller, Delete, Get, Next, Param, Query, Res } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImageService } from '../image.service';
import { NextFunction } from 'express';

@Controller('images')
export class ImagesController {
    
    constructor (
        private imagesService: ImagesService,
        private imageService: ImageService,
    ) {}

    @Get(':uuidFile')
    async downloadCompressedFileRoute(
        @Param('uuidFile') uuidFile: string,
        @Res() res: Response,
        @Next() next: NextFunction,
    ): Promise<void> {
        const image = await this.imageService.findImageByFileUuid(uuidFile);

        let stream;

        stream = await this.imagesService.downloadImage(
            image.filename,
            image.uuidFile,
        );

        stream.on('error', err => {
            next(err);
        });

        stream.pipe(res);
    }


    @Delete('bulk')
    async deleteBulk(
        @Query('ids') ids: Array<string | number>,
        @Query('imageSetId') imageSetId: number,
    ) {
        return await this.imagesService.deleteImageBulk(ids, imageSetId);
    }
}
