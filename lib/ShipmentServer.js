'use strict';

const _             = require('lodash');
const defaults      = require('defa');
const express       = require('express');
const bodyParser    = require('body-parser');
const child_process = require('child_process');
const morgan        = require('morgan');

const pkginfo = require('./pkginfo');

/**
 * HTTP server that exposes the actions of a Shipment instance
 * Default port: 6565
 *
 * Actions can be invoked via POST http://host:port/action-name
 * All data should be JSON-encoded and sent as the POST body.
 * Expected input: {args, verifyKey}
 */
class ShipmentServer {

    /**
     * @param {Shipment} shipment
     * @param {Object} options
     * @param {Number} options.port The port on which to listen for incoming connections (default SHIPMENT_PORT env)
     * @param {Number} options.basePath The base route (default SHIPMENT_BASE_PATH env)
     */
    constructor(shipment, options) {

        options = defaults(options, {
            port:     process.env.SHIPMENT_PORT,
            basePath: process.env.SHIPMENT_BASE_PATH,
            app:      () => this.makeApp()
        }, {
            port:     6565,
            basePath: ''
        });

        this.shipment = shipment;
        if (!this.shipment.exportPath)
            throw new Error('The Shipment instance passed to ShipmentServer must provide an exportPath');

        this.app      = options.app;
        this.port     = options.port;
        this.basePath = options.basePath;

        this.app.use(this.basePath, this.makeRouter(shipment));
    }

    /**
     * Instantiate the express app with the appropriate middleware
     * @returns {*}
     */
    makeApp() {
        let app = express();
        app.use(morgan('combined', {immediate: true}));
        app.use(bodyParser.json({type: "*/*"}));
        return app;
    }

    /**
     * Generate an express router that exposes all available actions in the given Shipment instance
     * @param {Shipment} shipment
     */
    makeRouter(shipment) {
        let router = express.Router();
        this.makeHelpRoute(shipment, router);
        _.forEach(this.shipment.actions, action => {
            router.post(this.getActionRoute(action), (req, res) => {
                let keys;
                // Check for other keys than args and/or verifyKey in request body object
                if (_.isObject(req.body) && _.difference(keys = _.keys(req.body), ['args', 'verifyKey']).length)
                    throw new Error(`Unexpected key(s) ('${_.take(keys, 3).join('\', \'')}'${keys.length > 3 ? '...' : ''}) ` +
                        `in request body, expecting 'args', 'verifyKey'.`);
                this.runAction(action, req.body, res);
            });
        });
        return router;
    }

    /**
     * Add the help route to the express router
     * @param {Shipment} shipment
     * @param {Router} router
     * @param {String} [url = "/"]
     */
    makeHelpRoute(shipment, router, url = "/") {
        router.get(url, (req, res) => {
            res.json({
                shipment: {version: pkginfo.version},
                app:      this.shipment.manual(),
            });
        });
    }

    /**
     * Get the route name (URL) for the given action
     * @param {BaseAction} action
     * @returns {string}
     */
    getActionRoute(action) {
        return '/' + action.getName();
    }

    /**
     * Get the file path of the shipment worker script that will be used by the forked process
     * @returns {string}
     */
    getWorkerPath() {
        return __dirname + '/ShipmentWorker.js';
    }

    /**
     * Create a child process that runs the given action with the given args
     * And pipe its output to the given stream
     * @param {BaseAction} action
     * @param {Object} args
     * @param {String} [verifyKey]
     * @param {http.res} stream
     */
    runAction(action, {args, verifyKey}, stream) {
        let fork = child_process.fork(this.getWorkerPath(), {silent: true});
        fork.stdout.pipe(stream);
        fork.stderr.pipe(stream);
        fork.send({
            exportPath: this.shipment.exportPath,
            action:     action.getName(),
                        args,
                        verifyKey,
        });
    }

    /**
     * Start the HTTP server and return its handle
     * @returns {http.Server}
     */
    serve() {
        const appName = this.shipment.getAppName();
        console.log(`Shipment server${appName ? ` (${appName})` : ''} listening on port ${this.port}`);
        return this.app.listen(this.port);
    }
}

module.exports = ShipmentServer;