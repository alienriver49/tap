import { PLATFORM } from 'aurelia-framework';

// Material components with Aurelia wrappers
// and custom components
export function configure(config) {
    const components = [
         PLATFORM.moduleName('webComponents/button/mdc-button'),
         PLATFORM.moduleName('webComponents/checkbox/mdc-checkbox'),
         PLATFORM.moduleName('webComponents/ripple/mdc-ripple'),
         PLATFORM.moduleName('webComponents/tapComponents/tap-test-component'),
         PLATFORM.moduleName('webComponents/dataTable/tap-data-table')
    ];
    config.globalResources(components);
}
