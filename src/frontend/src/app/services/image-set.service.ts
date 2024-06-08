import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { ImageSet, ImageSetCreateDto } from "../shared/interfaces";

@Injectable()
export class ImageSetService {

    constructor(private http: HttpService) { }

    async getAll(): Promise<ImageSet[]> {
        return (await this.http.get<ImageSet[]>('image-sets')) as ImageSet[];
    }

    async getOne(id: number): Promise<ImageSet> {
        console.log(id)
        return (await this.http.get<ImageSet>(`image-sets/${id}`)) as ImageSet;
    }

    async create(body: ImageSetCreateDto): Promise<ImageSet> {
        return (await this.http.post<ImageSet>(
            `image-sets/`,
             body
        )) as ImageSet;
    }

    async delete(id: number): Promise<ImageSet> {
        return (await this.http.delete<ImageSet>(
            `image-sets/${id}`,
        )) as ImageSet;
    }
}