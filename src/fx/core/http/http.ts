import { inject } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { FetchConfig, AuthService } from 'aurelia-auth';

@inject(HttpClient, FetchConfig, AuthService)
export class Http {
    constructor(
        private _httpClient: HttpClient,
        private _fetchConfig: FetchConfig,
        private _authService: AuthService
    ) { 
        _fetchConfig.configure();
    }

    public fetchRequest(url: string, options?: any) : Promise<Response> {
        return this._httpClient.fetch(url, options);
    }
}
