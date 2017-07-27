import 'whatwg-fetch'; // provides a polyfill for ES5
import { inject } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { FetchConfig, AuthService } from 'aurelia-auth'


@inject(HttpClient, FetchConfig, AuthService)
export class Http {
    constructor(
        private _httpClient: HttpClient,
        private _fetchConfig: FetchConfig,
        private _authService: AuthService
    ) { 
        _fetchConfig.configure();
    }

    fetchRequest(url: string, options: any) : Promise<Response> {
        console.info(this._authService.getTokenPayload());
        return this._httpClient.fetch(url, options);
    }
}

export default Http;