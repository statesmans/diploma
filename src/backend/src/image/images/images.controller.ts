import { Controller, Get, Next, Param, Res } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImageService } from '../image.service';
import { NextFunction } from 'express';

@Controller('images')
export class ImagesController {
    
    constructor (
        private imagesService: ImagesService,
        private imageService: ImageService,
    ) {

    }

    @Get(':imageSetId')
    getAllImagesByImageSetId(
        @Param('imageSetId') imageSetId: number
    ) {
        this.imagesService.getAllByImageSetId(imageSetId);
    }

    @Get(':uuidFile/:filename')
    async downloadCompressedFileRoute(
        @Param('uuidFile') uuidFile: string,
        @Param('filename') filename: string,
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


        // const cacheImagesSeconds = this.CACHE_IMAGES_HOURS * 60 * 60;

        // res.setHeader('Cache-Control', `max-age=${cacheImagesSeconds}`);
        stream.pipe(res);
    }

}
