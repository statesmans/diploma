import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { Image, Model, ModelCreateDto, ModelUpdateDto } from "../shared/interfaces";

@Injectable()
export class ModelService {

    constructor(private http: HttpService) {}

    async create(
        dto: ModelCreateDto
    ): Promise<Model> {
        return (await this.http.post<Model>(
            `models`, 
            dto
        )) as Model;
    }

    async delete(
        id: string,
    ): Promise<Model> {
        return (await this.http.delete<Model>(`models/${id}`)) as Model;
    }

    async getAll(search?: string): Promise<Model[]> {
        const query = search ? `search=${search}` : '';
        return (await this.http.get<Model[]>(`models?${query}`)) as Model[];
    }

    async getOne(
        id: string,
    ): Promise<Model> {
        return (await this.http.get<Model>(`models/${id}`)) as Model;
    }

    async startPredictionOnImage(
        modelId: string,
        imageId: number,
    ): Promise<void> {
        (await this.http.post<void>(`models/${modelId}/predict-image/${imageId}`, {})) as void;
    }

    async startPredictionOnImageSet(
        modelId: string,
        imageSetId: number,
    ): Promise<void> {
        (await this.http.post<void>(`models/${modelId}/predict-image-set/${imageSetId}`, {})) as void;
    }

    async startTraining(
        id: string,
    ): Promise<void> {
        (await this.http.post<void>(`models/${id}/train`, {})) as void;
    }

    async update(
        id: string,
        dto: ModelUpdateDto
    ): Promise<Model> {
        return (await this.http.patch<Model>(`models/${id}`, dto)) as Model;
    }
}