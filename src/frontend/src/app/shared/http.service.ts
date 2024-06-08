import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpService {

    constructor(
        private http: HttpClient,
    ) {}

    async get<T>(rawPath: string) {
        const path = this.getEndpoint(rawPath);

        return this.http.get<T>(path).toPromise();
    }

    async post<T>(
        rawPath: string, 
        body: Record<string, any>
    ) {
        const path = this.getEndpoint(rawPath);

        return this.http.post<T>(path, body).toPromise();
    }

    async patch<T>(
        rawPath: string, 
        body: Record<string, any>
    ) {
        const path = this.getEndpoint(rawPath);

        return this.http.patch<T>(path, body).toPromise();
    }

    async delete<T>(
        rawPath: string,
    ) {
        const path = this.getEndpoint(rawPath);

        return this.http.delete<T>(path).toPromise();
    }

    getBackendEndpoint() {
        return 'http://localhost:13001';
    }

    private getEndpoint(path: string) {
        return [this.getBackendEndpoint(), path].join('/');
    }
}

export function rebuildObjectToQuery(obj: Record<string, any>) {
    return Object.entries(obj)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                // Handle array values by creating key=value pairs for each element
                // "[]" here to explicitly tell nestjs that it is an array even if it has only 1 value 
                return value.map(element => `${key}[]=${element}`).join('&');
            } else {
                // Handle primitive values as before
                return `${key}=${value}`;
            }
        })
        .join('&');
}