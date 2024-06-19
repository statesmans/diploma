import { Injectable, OnInit } from "@angular/core";
import { HttpService, rebuildObjectToQuery } from "../shared/http.service";
import { Image, PaginatedResponse } from "../shared/interfaces";
import { HttpResponse } from "@angular/common/http";
import { DataResponse } from "../shared/data-response";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ImageService implements OnInit {

    constructor(private http: HttpService) {}

    deleteImageBulk(imageIds: number[] | ['all'], imageSetId: number): Promise<any> {
        const query = rebuildObjectToQuery({
            ids: imageIds,
            imageSetId
        });
        return this.http.delete(`images/bulk?${query}`);
    }

    async getAllByImageSet(imageSetId: number, queryObj: Record<string, any> = {}): Promise<PaginatedResponse<Image>> {
        const query = rebuildObjectToQuery(queryObj);
        return (await this.http.get<PaginatedResponse<Image>>(`image/${imageSetId}?${query}`)) as PaginatedResponse<Image>;
    }

    getImageUrl(uuidFile: string) {
        return `${this.http.getBackendEndpoint()}/images/${uuidFile}`
    }

    async getOne(
        imageId: string,
    ): Promise<Image> {
        return (await this.http.get<Image>(`image/${imageId}`)) as Image;
    }

    async ngOnInit(): Promise<void> {}

    async prepareFiles(files: FileList | File[], imageSetId: number) {
        const images = []
        for (let i = 0; i < files.length; i++) {
            const blobFile = files[i];

            if (blobFile && blobFile instanceof Blob) {
                const formData: FormData = new FormData();
                const name = blobFile.name.replace(/[^a-z0-9 ,.?!]/gi, '_').toLowerCase();
                formData.append('image', blobFile, name);
                images.push(this.uploadImage(formData, { imageSetId }))
            }
        }
        await Promise.all(images)
        
    }

    async uploadImage(file: FormData, queryObj: Record<string, any>): Promise<Image> {
        const query = rebuildObjectToQuery(queryObj);
        const res = await this.http.post<Image>(
            `image?${query}`,
            file,
        ) as Image;
        return res;
    }
}