import { PLATFORM } from 'aurelia-framework';

// Material components with Aurelia wrappers
// and custom components
export function configure(config) {
    const components = [
         PLATFORM.moduleName('src/webComponents/button/mdc-button'),
         PLATFORM.moduleName('src/webComponents/checkbox/mdc-checkbox'),
         PLATFORM.moduleName('src/webComponents/ripple/mdc-ripple'),
         PLATFORM.moduleName('src/webComponents/tapComponents/tap-test-component'),
         PLATFORM.moduleName('src/webComponents/dataTable/formatCell'),
         PLATFORM.moduleName('src/webComponents/dataTable/tap-data-table')
    ];
    config.globalResources(components);
}
