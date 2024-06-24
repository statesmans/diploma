import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { ImageSet, ImageSetCreateDto, ImageSetUpdateDto } from "../shared/interfaces";

@Injectable()
export class ImageSetService {

    constructor(private http: HttpService) { }

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

    async getAll(search?: string): Promise<ImageSet[]> {
        const query = search ? `search=${search}` : '';
        return (await this.http.get<ImageSet[]>(`image-sets?${query}`)) as ImageSet[];
    }

    async getOne(id: number): Promise<ImageSet> {
        return (await this.http.get<ImageSet>(`image-sets/${id}`)) as ImageSet;
    }

    async update(id: number, body: ImageSetUpdateDto): Promise<ImageSet> {
        return (await this.http.patch<ImageSet>(
            `image-sets/${id}`, body
        )) as ImageSet;
    }
}