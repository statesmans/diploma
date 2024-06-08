import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http.service";
import { DefectClass } from "../shared/interfaces";

@Injectable()
export class DefectClassService {

    constructor(private http: HttpService) {}

    async getAll(): Promise<DefectClass[]> {
        return (await this.http.get<DefectClass[]>(`defect-class`)) as DefectClass[];
    }

}