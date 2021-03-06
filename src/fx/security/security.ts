import { inject } from 'aurelia-dependency-injection';
import { AuthService, BaseConfig } from 'aurelia-auth';
import { Http } from '../core/http/http';
import { config } from './authConfig';

export interface IUserInfo {
    sub: string;
    userName: string;
    formattedName: string;
} 

@inject(AuthService, BaseConfig, Http)
export class Security {
    constructor(
        private _authService: AuthService,
        private _baseConfig: BaseConfig,
        private _http: Http
    ) { 
        this._baseConfig.configure(config);
    }

    /**
     * Returns the token payload
     */
    public getTokenPayload(): any {
        return this._authService.getTokenPayload();
    }

    /**
     * Returns the claim value for the key that's passed, or null if no claim exists for the passed key.
     * @param key 
     */
    public getTokenClaimValue(key: string): any {
        const payload = this._authService.getTokenPayload();

        if (payload[key] === undefined) {
            return null;
        } else {
            return payload[key];
        }
    }

    /**
     * Retrieves the user info from the UserInfo service
     */
    public getUserInfo(): IUserInfo {
        // TODO: Looking up the user info here. 

        // this._authService.getMe() will call the profileUrl that's set in the auth config. 
        // Tyler Id isn't diong authorization, so the username will come from the authentication token for now.
        // Any additional user info (roles, etc.) would ahve to come from application tables/services
        // return this._authService.getMe();

        // Get the user name from the auth token
        let firstName: string = '', lastName: string = '', userName: string;
        const sub: string = this.getTokenClaimValue('sub');
        
        if (sub.indexOf('TYLER\\') >= 0) {
            userName = sub.substring(sub.indexOf('TYLER\\') + 6);
        } else {
            userName = sub;
        }

        if (userName.indexOf('.') >= 0) {
            const split: string[] = userName.split('.');
            firstName = split[0] == null ? '' : split[0];
            lastName = split[1] == null ? '' : split[1];

            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        }

        const user: IUserInfo = {
            sub,
            userName,
            formattedName: firstName + ' ' + lastName
        };

        return user;
    }

}
