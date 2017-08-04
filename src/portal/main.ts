import { Aurelia, PLATFORM, FrameworkConfiguration, LogManager } from 'aurelia-framework';
import { ConsoleAppender } from 'aurelia-logging-console';
import { AuthService } from 'aurelia-auth';

import { init } from '../fx/core/bootstrap';
import { config } from '../fx/security/authConfig';

import { CommandManager } from './commanding/commandManager';
import { ExtensionManager } from './extensionManagement/extensionManager';
import { ExtensionLoaderEngine } from './extensionManagement/extensionLoaderEngine';
import { AuthorizationEngine } from './authorization/authorizationEngine';

export function configure(aurelia: Aurelia) {
    console.log('[TAP-SHELL] Configuring shell');
    init().then((tapFx) => {
        aurelia.host = document.body;
        // The app and tapFx have separate instances of Aurelia,
        // Use singletons from TapFx in the app
        aurelia.container.registerInstance('TapFx', tapFx);
        aurelia.container.registerSingleton(CommandManager, CommandManager);
        aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
        aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
        aurelia.container.registerSingleton(AuthorizationEngine, AuthorizationEngine);

        // Check for an auth end point in the config, otherwise use what's set in authConfig.js
        //let authEndPoint: any = tapFx.Configuration.getConfigValue('authorizationEndpoint');

        //if (authEndPoint != undefined)
        //    config.providers.TylerId.authorizationEndpoint = authEndPoint;

        aurelia.use
            .basicConfiguration()
            .history()
            // Register the components globally so we don't need to
            // 'require' them in each html (useful when dynamically creating views)
            .feature(PLATFORM.moduleName('src/webComponents/index'))
            .developmentLogging()
            .plugin(PLATFORM.moduleName('aurelia-auth'), (baseConfig) => {
                baseConfig.configure(config);
            });

        const auth: AuthService = aurelia.container.get(AuthService);
        aurelia.start().then(() => {
            //if (auth.isAuthenticated()) {
            //    console.log('[SHELL] Authenticated! ', auth.getTokenPayload());
                aurelia.setRoot();
            //}
            //else {
            //    console.log('[SHELL] Not authenticated!');
            //    auth.authenticate('TylerId', false, {});
            //}

            //delete(tapFx.Aurelia);
        });
    });
}
