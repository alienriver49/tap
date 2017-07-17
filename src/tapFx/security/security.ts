import { inject } from 'aurelia-dependency-injection';
import { AuthService, BaseConfig } from 'aurelia-auth'
import Http from '../core/http/http'
import config from './authConfig';


@inject(AuthService, BaseConfig, Http)
class Security {

    constructor(private _authService: AuthService,
                private _baseConfig: BaseConfig,
                private _http: Http) { 
                    this._baseConfig.configure(config);
                }

    /**
     * Returns the token payload
     */
    getTokenPayload() : any {
        return this._authService.getTokenPayload();
    }

    /**
     * Returns the claim value for the key that's passed, or null if no claim exists for the passed key.
     * @param key 
     */
    getTokenClaimValue(key: string) : any {
        let payload = this._authService.getTokenPayload();

        if (payload[key] == undefined) 
            return null;
        else
            return payload[key];
    }

    /**
     * Retrieves the user info from the UserInfo service
     */
    getUserInfo(): any {
        // TODO: This method will be called as part of the initialization of this class. Should be looking up the user info here. 
        // authService.getMe() will call the profileUrl that's set in the auth config
        return this._authService.getMe();
    }

}

export default Security;