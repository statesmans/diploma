import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {

    // constructor(
    //     private log: LogService,
    //     private fileRepo: FileRepo,
    //     private fileService: FileService,
    //     private azureAdapterService: AzureAdapterService,
    //     private azureConfigService: AzureConfigService,
    // ) { }

    // async uploadFile(req: AuthenticatedRequest, res: Response) {
    //     ow(req, 'file', ow.object.nonEmpty.hasKeys('file'));

    //     const { refId, tags, status } = Joi.attempt(
    //         req.query,
    //         Joi.object().keys({
    //             refId: Joi.string(),
    //             tags: [Joi.array().items([Joi.string()]), Joi.string()],
    //             status: Joi.string(),
    //         }),
    //         'Incorrect query params',
    //     );

    //     // eslint-disable-next-line prefer-const
    //     let { container, filename, id } = Joi.attempt(
    //         req.params,
    //         Joi.object().keys({
    //             filename: Joi.string()
    //                 .allow('')
    //                 .optional(),
    //             container: Joi.string()
    //                 .allow('')
    //                 .optional()
    //                 .default('default'),
    //             id: Joi.string()
    //                 .optional()
    //                 .default(generateId()),
    //         }),
    //         'Incorrect query params',
    //     );

    //     // const { filename, id } = req.params;

    //     const rights = [{ resourceId: 'files', rightKey: 'create_file' }];

    //     /**
    //      * complex file access isn't tested and implemented yet. There must be a bridge for deactivating
    //      */
    //     // if (refId) {
    //     //   rights.push({ resourceId: refId, rightKey: 'create_file' });
    //     // }

    //     // if (tags instanceof Array) {
    //     //   tags.forEach((tag: string) =>
    //     //     rights.push({ resourceId: refId, rightKey: `create_${tag}_file` }),
    //     //   );
    //     // } else if (tags instanceof String) {
    //     //   rights.push({ resourceId: refId, rightKey: `create_${tags}_file` });
    //     // }

    //     await this.authService.requireRights(req, rights);

    //     try {
    //         const file = req.file!;
    //         const fileName = this.normalizeFilename(filename || file.filename);
    //         let storedFile;
    //         let token = '';

    //         if (!isSupported(getExtension(fileName))) {
    //             throw new Error('type of uploaded file is not supported');
    //         }

    //         if (await this.azureConfigService.isEnabled()) {
    //             // Azure storage
    //             const {
    //                 containerName: defaultContainerName,
    //             } = await this.azureConfigService.getAzureBlobStoreCredentials();
    //             if (!container) {
    //                 container = defaultContainerName;
    //             }

    //             await this.azureAdapterService.uploadFile(
    //                 { ...file, originalname: fileName, destination: '/', id },
    //                 container,
    //             );
    //             storedFile = {};
    //         } else {
    //             // local disk storage
    //             storedFile = await this.fileRepo.save(
    //                 id,
    //                 file,
    //                 refId,
    //                 tags,
    //                 req.auth.userId,
    //                 status,
    //             );
    //             await this.fileService.saveFile(id, file);
    //             token = this.fileService.createFileToken(id);
    //             await this.fileRepo.saveToken(id, token);
    //         }
    //         const relativePublicUrl = `/v1/files/${id}/download/${token}`;
    //         const relativePrivateUrl = `/v1/files/${id}/download`;

    //         let fileServiceUrl = Config.fileServicePublicUrl;
    //         if (process.env.NODE_ENV === 'testing') {
    //             fileServiceUrl = `${req.protocol}://${req.get('host')}/v1`;
    //         }
    //         fileServiceUrl = fileServiceUrl.replace('/v1', '');

    //         const publicUrl = `${fileServiceUrl}${relativePublicUrl}`;
    //         const privateUrl = `${fileServiceUrl}${relativePrivateUrl}`;
    //         const relativeThumbnailPublicUrl = `/v1/files/${id}/thumbnail/${token}`;
    //         const relativeThumbnailPrivateUrl = `/v1/files/${id}/thumbnail`;
    //         const thumbnailPublicUrl = `${fileServiceUrl}${relativeThumbnailPublicUrl}`;
    //         const thumbnailPrivateUrl = `${fileServiceUrl}${relativeThumbnailPrivateUrl}`;
    //         res.json({
    //             data: Object.assign(
    //                 { ...storedFile, id },
    //                 {
    //                     relativePublicUrl,
    //                     relativePrivateUrl,
    //                     publicUrl,
    //                     privateUrl,
    //                     relativeThumbnailPublicUrl,
    //                     relativeThumbnailPrivateUrl,
    //                     thumbnailPublicUrl,
    //                     thumbnailPrivateUrl,
    //                     filename: fileName,
    //                     status,
    //                 },
    //             ),
    //             meta: {},
    //         });
    //     } catch (e) {
    //         console.log(e);
    //         handleError(e as CommonError);
    //     }
    // }

    // normalizeFilename(filename: string) {
    //     // allow spaces in filenames
    //     return filename.replace(/[^a-zA-Z0-9.\-_ ]/g, '_');
    // }

}
