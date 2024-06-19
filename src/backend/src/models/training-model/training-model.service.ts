
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { TrainingManifest, InferenceManifest, InferenceResponse, Hyperparameters } from '../dto/model.dto';
@Injectable()
export class TrainingModelService {
    pythonServiceURL = 'http://host.docker.internal:8000';
    constructor() {}


    async startTraining(manifest: TrainingManifest, hyperparameters: Hyperparameters) {
        try {
            const { data } = await axios.post<string>(`${this.pythonServiceURL}/training`, {
                hyperparameters,
                manifest
            });
            return data;
        } catch (e) {
            throw new InternalServerErrorException(e.response.data.detail)
        }
    }

    async predict(manifest: InferenceManifest, hyperparameters: Hyperparameters) {
        try {
            const { data } = await axios.post<InferenceResponse>(`${this.pythonServiceURL}/predict`, {
                hyperparameters,
                manifest
            });
            return data;
        } catch (e) {
            throw new InternalServerErrorException(e.response.data.detail)
        }
    }
}

