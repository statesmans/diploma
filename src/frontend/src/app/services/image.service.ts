import { Injectable, OnInit } from "@angular/core";
import { HttpService, rebuildObjectToQuery } from "../shared/http.service";
import { Image } from "../shared/interfaces";
import { HttpResponse } from "@angular/common/http";
import { DataResponse } from "../shared/data-response";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ImageService implements OnInit {

    images = new BehaviorSubject<Image[]>([])

    constructor(private http: HttpService) {}

    async ngOnInit(): Promise<void> {
        // this.images.next(
        //     this.get
        // )
    }

    async getAllByImageSet(imageSetId: number): Promise<Image[]> {
        return (await this.http.get<Image[]>(`image/${imageSetId}`)) as Image[];
    }

    async getOne(
        imageId: string,
    ): Promise<Image> {
        return (await this.http.get<Image>(`image/${imageId}`)) as Image;
    }

    async getOneImageStram(
        filename: string, 
        uuidFile: string
    ): Promise<Image> {
        return (await this.http.get<Image>(`images/${uuidFile}/${filename}`)) as Image;
    }

    async uploadImage(file: FormData, queryObj: Record<string, any>): Promise<Image> {
        const query = rebuildObjectToQuery(queryObj);
        const res = await this.http.post<Image>(
            `image?${query}`,
            file,
        ) as Image;
        return res;
    }

    async prepareFiles(files: FileList | File[], imageSetId: number) {
        const images: Promise<Image>[] = [];

        for (let i = 0; i < files.length; i++) {
            const blobFile = files[i];

            if (blobFile && blobFile instanceof Blob) {
                const formData: FormData = new FormData();
                const name = blobFile.name.replace(/[^a-z0-9 ,.?!]/gi, '_').toLowerCase();
                formData.append('image', blobFile, name);
                images.push(
                    this.uploadImage(formData, { imageSetId })
                )
            }
        }
        

        return await Promise.all(images);
    }

    getImageUrl(filename: string, uuidFile: string) {
        return `${this.http.getBackendEndpoint()}/images/${uuidFile}/${filename}`
    }
}