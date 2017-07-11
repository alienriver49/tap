import { inject } from 'aurelia-dependency-injection';
import { AuthService } from "aurelia-auth";
import Permissions from "./permissions";

@inject(Permissions)
class AuthorizationEngine {
    
    constructor(private authService: AuthService, 
                private permissions: Permissions) { 
        this.permissions = permissions;
        this.authService = authService;
    }

    getTokenPayload() : any {
        return this.authService.getTokenPayload();
    }

    canLoadExtension(resource: String) : Promise<boolean> {
        // Check access for the specific resource being requested
        // This permission service is stubbed out, but in the future will be a service call
        return new Promise((resolve, reject) => {
            if (this.permissions.checkMenuSecurity(resource)) {
                resolve(true);
            }
            else {
                reject(false);
            }
        });
    }
}

export default AuthorizationEngine;