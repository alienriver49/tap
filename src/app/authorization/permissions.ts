
class PermissionService {

    constructor () {  }

    private _resources: String[] = ["setup", "main"];

    checkMenuSecurity(resource: String) : boolean {
        return this._resources.indexOf(resource) > 0;
    }
}

export default PermissionService;