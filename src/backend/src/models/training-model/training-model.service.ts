
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { TrainingManifest, InferenceManifest } from '../dto/model.dto';
@Injectable()
export class TrainingModelService {
    pythonServiceURL = 'http://host.docker.internal:8000';
    constructor() {}


    async startTraining(manifest: TrainingManifest) {
        try {
            const { data } = await axios.post<string>(`${this.pythonServiceURL}/training`, {
                hyperparameters: {},
                manifest
            });
            return data;
        } catch (e) {
            console.log(e)
        }
    }

    async predict(manifest: InferenceManifest) {
        try {
            const { data } = await axios.post<string>(`${this.pythonServiceURL}/predict`, {
                hyperparameters: {},
                manifest
            });
            return data;
        } catch (e) {
            console.log(e)
        }
    }
}
