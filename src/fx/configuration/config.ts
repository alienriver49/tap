import { inject } from 'aurelia-dependency-injection';
import { Http } from '../core/http/http'

@inject(Http)
export class Configuration {

    private _config: Map<String, String> = new Map<String, String>();

    constructor(public http: Http) { 
        this._getConfig();
    }

    /**
     * Returns the value of the configuration parameter identified by the passed key, or undefined if the key doens't exist
     */
    getConfigValue(key: String) : any {
        return this._config.get(key);
    }

    /**
     * Set config value based on the passed key/value pair
     */
    setConfigValue(key: String, value: String) : void {
        this._config.set(key, value);
    }

    /**
     * Save the config data
     */
    saveConfig() : void {
        this._saveConfig();
    }

    /**
     * TODO: Retrieve the config from persistence
     */
    private _getConfig() : void {        
        this.http.fetchRequest('/api/siteconfiguration', {})
            .then(response => {
                return response.json();
            }).then(data => {
                console.log('[CONFIG] _getConfig: ', data);
                this._setConfig(data);
        });
    }

    /**
     * Parse the JSON config data and populate the configuration map.
     */
    private _setConfig(data: any) : void {
        this._config = new Map<String, String>();

        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                this._config.set(i, data[i]);
            }
        }
    }

    private _saveConfig() : void {
        this.http.fetchRequest('', {
                method: 'post',
                body: JSON.stringify(this._config)
            }).then(response => {
                console.log('[CONFIG] _saveConfig: ', response);
            });
    }

}