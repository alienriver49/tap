import { inject } from 'aurelia-dependency-injection';
import { AuthService } from 'aurelia-auth';

import { PermissionService } from './permissions';

@inject(PermissionService)
export class AuthorizationEngine {
    
    constructor(private authService: AuthService, 
                private permissions: PermissionService) { 
        this.permissions = permissions;
        this.authService = authService;
    }

    public canLoadExtension(resource: string): Promise<boolean> {
        // Check access for the specific resource being requested
        // This permission service is stubbed out, but in the future will be a service call
        return new Promise((resolve, reject) => {
            if (this.permissions.checkMenuSecurity(resource)) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    }
}
