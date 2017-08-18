import { PLATFORM } from 'aurelia-framework';

// Material components with Aurelia wrappers
// and custom components
export function configure(config) {
    const components = [
         PLATFORM.moduleName('src/web-components/button/mdc-button'),
         PLATFORM.moduleName('src/web-components/checkbox/mdc-checkbox'),
         PLATFORM.moduleName('src/web-components/ripple/mdc-ripple'),
         PLATFORM.moduleName('src/web-components/tapComponents/tap-test-component'),
         PLATFORM.moduleName('src/web-components/dataTable/formatCell'),
         PLATFORM.moduleName('src/web-components/dataTable/tap-data-table')
    ];
    config.globalResources(components);
}
