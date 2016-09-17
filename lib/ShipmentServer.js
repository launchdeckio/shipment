'use strict';

const _             = require('lodash');
const defaults      = require('defa');
const express       = require('express');
const bodyParser    = require('body-parser');
const child_process = require('child_process');
const objectHash    = require('object-hash');

/**
 * HTTP server that exposes the actions of a Shipment instance
 */
class ShipmentServer {

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
        app.use(bodyParser.json());
        return app;
    }

    /**
     * Generate an express router for the given Shipment instance
     * @param {Shipment} shipment
     */
    makeRouter(shipment) {
        let router = express.Router();
        _.forEach(_.map(shipment.actions, Action => new Action), action => {
            router.post(this.getActionRoute(action), (req, res) => this.runAction(action, req.body, res))
        });
        return router;
    }

    /**
     * Get the route name (URL) for the given action
     * @param {Action} action
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
     * And pipe its output to the response
     * @param {Action} action
     * @param {Object} args
     * @param {http.res} res
     */
    runAction(action, args, res) {
        let fork = child_process.fork(this.getWorkerPath(), {silent: true});
        fork.stdout.pipe(res);
        fork.stderr.pipe(res);
        fork.send({
            exportPath: this.shipment.exportPath,
            hash:       objectHash(this.shipment),
            action:     action.getName(),
                        args
        });
    }

    /**
     * Start the HTTP server and return its handle
     * @returns {http.Server}
     */
    serve() {
        console.log(`Shipment server listening on port ${this.port}`);
        return this.app.listen(this.port);
    }
}

module.exports = ShipmentServer;