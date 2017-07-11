import { inject } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { FetchConfig } from 'aurelia-auth'

@inject(HttpClient, FetchConfig)
class Auth {
    
    constructor(private http: HttpClient,
                private fetchConfig: FetchConfig) { 
        this.http = http;
        fetchConfig.configure();
    }

    fetchRequest(url: string, options: any) : Promise<Response> {
        return this.http.fetch( url, options);
    }
}

export default Auth;