import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { Image, Model, ModelCreateDto, ModelUpdateDto } from "../shared/interfaces";

@Injectable()
export class ModelService {

    constructor(private http: HttpService) {}

    async getAll(): Promise<Model[]> {
        return (await this.http.get<Model[]>(`models`)) as Model[];
    }

    async getOne(
        id: string,
    ): Promise<Model> {
        return (await this.http.get<Model>(`models/${id}`)) as Model;
    }

    async create(
        dto: ModelCreateDto
    ): Promise<Model> {
        return (await this.http.post<Model>(
            `models`, 
            dto
        )) as Model;
    }

    async update(
        id: string,
        dto: ModelUpdateDto
    ): Promise<Model> {
        return (await this.http.patch<Model>(`models/${id}`, dto)) as Model;
    }

    async delete(
        id: string,
    ): Promise<Model> {
        return (await this.http.delete<Model>(`models/${id}`)) as Model;
    }

    async startTraining(
        id: string,
    ): Promise<void> {
        (await this.http.post<void>(`models/${id}/train`, {})) as void;
    }
}