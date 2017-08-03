export class PermissionService {
    private _resources: string[] = ['setup', 'main'];

    public checkMenuSecurity(resource: string): boolean {
        return this._resources.indexOf(resource) > 0;
    }
}
