import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { Label, LabelCreateDto, LabelUpdateDto, Model } from "../shared/interfaces";



@Injectable()
export class LabelService {

    constructor(private http: HttpService) { }


    async getOneByImageId(id: number): Promise<Label> {
        return (await this.http.get<Label>(`label/image-id/${id}`)) as Label;
    }

    async getManualByImageId(id: number): Promise<Label> {
        return (await this.http.get<Label>(`label/manual/image-id/${id}`)) as Label;
    }

    async getAutomaticByImageId(id: number): Promise<Label[]> {
        return (await this.http.get<Label[]>(`label/automatic/image-id/${id}`)) as Label[];
    }

    async getAllInferredWithModel(imageId: number): Promise<Label[] > {
        return (await this.http.get<Label[]>(`label/all-inferred/${imageId}`)) as Label[];
    }

    async create(body: LabelCreateDto): Promise<Label> {
        return (await this.http.post<Label>(
            `label`,
             body
        )) as Label;
    }

    async update(id: number,  body: LabelUpdateDto): Promise<Label> {
        return (await this.http.patch<Label>(
            `label/${id}`,
             body
        )) as Label;
    }

    async delete(id: number): Promise<Label> {
        return (await this.http.delete<Label>(
            `label/${id}`,
        )) as Label;
    }
}