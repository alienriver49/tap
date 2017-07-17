import { inject } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { FetchConfig, AuthService } from 'aurelia-auth'


@inject(HttpClient, FetchConfig, AuthService)
class Http {
    
    constructor(private _http: HttpClient,
                private _fetchConfig: FetchConfig,
                private _auth: AuthService) { 
        _fetchConfig.configure();
    }

    fetchRequest(url: string, options: any) : Promise<Response> {
        console.info(this._auth.getTokenPayload());
        return this._http.fetch( url, options);
    }
}

export default Http;