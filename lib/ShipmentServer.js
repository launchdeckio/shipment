'use strict';

const {forEach, isEmpty, difference, keys, isEqual} = require('lodash');

const ursa          = require('ursa');
const defaults      = require('defa');
const express       = require('express');
const bodyParser    = require('body-parser');
const child_process = require('child_process');
const morgan        = require('morgan');
const LineWrapper   = require('stream-line-wrapper');

const pkginfo = require('./pkginfo');

/**
 * HTTP server that exposes the actions of a Shipment instance
 * Default port: 6565
 *
 * Actions can be invoked via POST http://host:port/action-name
 * All data should be JSON-encoded and sent as the POST body.
 * Expected request body payload: {args, verifyKey}
 * In encrypted mode, the request body should look like this: {encrypted: (encrypted payload)}
 * The verify key will be used in the output of the fork in formatting some lifecycle events
 * The client may use this key to verify that these lifecycle events are legitimate
 */
class ShipmentServer {

    /**
     * @param {Shipment} shipment
     * @param {Object} options
     * @param {Number} options.port The port on which to listen for incoming connections (default SHIPMENT_PORT env)
     * @param {Number} options.basePath The base route (default SHIPMENT_BASE_PATH env)
     * @param {Object} options.encrypt Enable asymmetric encryption (experimental)
     *                                  NOTE: encryption is only enabled on INCOMING PAYLOADS
     *                                  and no CERTIFICATE is used!
     * @param {Boolean} [options.output = true] Whether to pipe output from the worker process to standard streams
     */
    constructor(shipment, options) {

        options = defaults(options, {
            output:   true,
            port:     process.env.SHIPMENT_PORT,
            basePath: process.env.SHIPMENT_BASE_PATH,
            encrypt:  false,
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
        this.output   = options.output;
        this.encrypt  = options.encrypt;

        if (this.encrypt)
            this.enableEncryption();

        this.app.use(this.basePath, this.router());
    }

    /**
     * Generate keys and setup the decryption middleware
     */
    enableEncryption() {
        const key    = ursa.generatePrivateKey(1024, 65537);
        this.private = key;
        this.public  = key.toPublicPem();
        this.app.use((req, res, next) => {
            if (!isEmpty(req.body)) {
                if (!isEqual(keys(req.body), ['encrypted']))
                    next(new Error('All request payloads should be encrypted.'));
                req.body = JSON.parse(this.private.decrypt(req.body.encrypted, 'base64', 'utf8'));
            }
            next();
        });
    }

    /**
     * Instantiate the express app with the appropriate middleware
     * @returns {*}
     */
    makeApp() {
        let app = express();
        app.use(morgan('combined', {immediate: true}));
        app.use(bodyParser.json({type: '*/*'}));
        return app;
    }

    /**
     * Generate an express router that exposes all available actions in the Shipment instance
     * @returns {Router}
     */
    router() {
        let router = express.Router();
        router.get('', this.indexRoute());
        forEach(this.shipment.actions, action => {
            router.post(this.getActionUrl(action), this.actionRoute(action));
        });
        return router;
    }

    /**
     * Get a route handler for the index / help route
     * @returns {function}
     */
    indexRoute() {
        return (req, res) => {
            const data = {
                shipment: {version: pkginfo.version},
            };
            if (this.encrypt) {
                data.encrypted = true;
                data.key       = this.public.toString('ascii');
            }
            data.app = this.shipment.manual();
            res.json(data);
        };
    }

    /**
     * Get a route handler for the given action
     * @param action
     * @returns {function}
     */
    actionRoute(action) {
        return (req, res) => {

            // Check for other keys than args and/or verifyKey in request body object
            const diff = difference(keys(req.body), ['args', 'verifyKey']);

            if (diff.length)
                throw new Error(`Unexpected key(s) ('${diff.join('\', \'')}'${diff.length > 3 ? '...' : ''}) ` +
                    'in request body, expecting \'args\', \'verifyKey\'.');

            this.runAction(action, req.body, res);
        };
    }

    /**
     * Get the route name (URL) for the given action
     * @param {BaseAction} action
     * @returns {string}
     */
    getActionUrl(action) {
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
        if (this.output) {
            fork.stdout.pipe(new LineWrapper({prefix: '| '})).pipe(process.stdout);
            fork.stderr.pipe(new LineWrapper({prefix: '| '})).pipe(process.stderr);
        }
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
        console.log(`Shipment server${appName ? ` (${appName})` : ''} listening on port ${this.port}`); // eslint-disable-line no-console
        return this.app.listen(this.port);
    }
}

module.exports = ShipmentServer;