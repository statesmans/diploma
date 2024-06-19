import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { CreateDefectClassDto, DefectClass } from "../shared/interfaces";


@Injectable()
export class DefectClassService {

    constructor(private http: HttpService) {}

    async create(
        dto: CreateDefectClassDto
    ): Promise<DefectClass> {
        return (await this.http.post<DefectClass>(`defect-class`, dto)) as DefectClass;
    }

    async delete(id: number): Promise<void> {
        return (await this.http.delete<void>(`defect-class/${id}`)) as void;
    }

    async getAll(): Promise<DefectClass[]> {
        return (await this.http.get<DefectClass[]>(`defect-class`)) as DefectClass[];
    }
}