'use strict';
const noOverride = require('fastify-plugin');
const path = require('path');
const { findDirectoryPathInModule } = require('./helpers');

/**
 * TODO: Make compatible with core.io-express-server
 * @see https://github.com/goliatone/core.io-express-server/blob/master/lib/initializeSubapp.js
 * 
 * @param {Object} App 
 * @param {Object} [options={}] 
 */
module.exports = function(App, options = {}) {

    /**
     * Usually we pass a configuration object rather
     * than a custom application.
     */
    if (arguments.length === 1 && typeof App.init !== 'function') {
        options = App;
    }

    return function(context, config) {

        const logger = context.getLogger(config.moduleid);

        const routes = findDirectoryPathInModule('routes', options.moduleDirName, config.moduleid);
        const middleware = findDirectoryPathInModule('middleware', options.moduleDirName, config.moduleid);

        logger.info('-> initialize %s', config.moduleid);
        logger.info('-> routes %s', routes);
        logger.info('-> middleware %s', middleware);

        context.resolve(config.dependencies, true).then(_ => {
            logger.info('dependencies solved...');

            /**
             * We wait for our server hook to run,
             * this is before the server starts.
             * We get passed an instance to attach 
             * our module.
             */
            context.on('server.pre', configurator => {
                logger.info('server.pre register dashboard routes...');

                /**
                 * The core.io server module has been loaded, now
                 * we have access to register our modules middleware
                 * and routes.
                 * TODO: We might want to register under a given module, 
                 * say `admin`, so that we can reuse the same middleware.
                 * Otherwise we have to load some middleware twice...
                 */
                configurator.server.register(noOverride(function(fastify, opts, done) {
                    logger.warn('Registering routes with prefix %s', config.mount);
                    /**
                     * Register all middleware. 
                     * We should make sure that this app actually 
                     * needs middleware.
                     * TODO: Make both not required!
                     */
                    fastify.register(require(middleware)).after(_ => {
                        fastify.register(require(routes), {
                            prefix: config.mount
                        });
                    });
                    done();
                }));
            });
        });
    };
};

module.exports.priority = -100;