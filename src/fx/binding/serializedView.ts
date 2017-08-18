
export interface ISerializedViewConfig {
    view: string;
    viewName: string;
}
export class SerializedView {
    public view: string;
    public viewName: string;

    constructor(config: ISerializedViewConfig) {
        this.view = config.view;
        this.viewName = config.viewName;
    }
}
