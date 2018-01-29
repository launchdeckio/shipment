const {difference, mapValues} = require('lodash');

const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');

const runActionViaApi = require('./runActionViaApi');

/**
 * HTTP server that exposes the actions of a Shipment instance
 * Default port: 6565
 *
 * Actions can be invoked via POST http://host:port/action-name
 * All data should be JSON-encoded and sent as the POST body.
 * Expected request body payload: {args, verifyKey}
 * The verify key will be used in the output of the fork in formatting some lifecycle events
 * The client may use this key to verify that these lifecycle events are legitimate
 */
class ShipmentServer {

    /**
     * @param {Shipment} shipment
     * @param {Number} basePath The base route (default SHIPMENT_BASE_PATH env)
     * @param {Boolean} [output = true] Whether to pipe output from the worker process to standard streams
     * @param {http.Server} [app = null] Override server
     */
    constructor(shipment, {

        output = true,
        basePath = process.env.SHIPMENT_BASE_PATH | '',
        app = null,

    } = {}) {

        if (!app) app = ShipmentServer.makeApp();

        this.shipment = shipment;

        this.app      = app;
        this.basePath = basePath;
        this.output   = output;

        this.app.use(this.basePath, this.router());
    }

    /**
     * Generate an express router that exposes all available actions in the Shipment instance
     * @returns {Router}
     */
    router() {
        let router = express.Router();
        router.get('', this.indexRoute());
        for (const name in this.shipment.actions) {
            const action = this.shipment.actions[name];
            router.post(this.getActionUrl(action), this.actionRoute(action));
        }
        return router;
    }

    /**
     * Generate an object describing the application,
     * available actions and their options
     *
     * @returns {Object}
     */
    get manual() {

        const actions = mapValues(this.shipment.actions, action => ({description: action.description}));

        return {actions};
    }

    /**
     * Get a route handler for the index / help route
     * @returns {function}
     */
    indexRoute() {
        return (req, res) => {
            res.json({app: this.manual});
        };
    }

    /**
     * Get a route handler for the given action
     * @param {String} action
     * @returns {function}
     */
    actionRoute(action) {
        return (req, res) => {

            // Check for other keys than args and/or verifyKey in request body object
            const diff = difference(Object.keys(req.body), ['args', 'verifyKey']);

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
        return '/' + action.name;
    }

    /**
     * Create a child process that runs the given action with the given args
     * And pipe its output to the given stream
     */
    runAction(...args) {
        const complete = (async () => {
            try {
                await runActionViaApi({output: this.output}, ...args);
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
                console.warn(`Above error occurred in action "${args[0].name}"`); // eslint-disable-line no-console
            }
        });
        return {complete};
    }

    /**
     * Start the HTTP server and return its handle
     * @returns {http.Server}
     */
    listen(port = 6565) {
        console.log(`Shipment server listening on port ${port}`); // eslint-disable-line no-console
        return this.app.listen(port);
    }

    /**
     * Instantiate the default express app with the appropriate middleware
     * @returns {*}
     */
    static makeApp() {
        let app = express();
        app.use(morgan('combined', {immediate: true}));
        app.use(bodyParser.json({type: '*/*'}));
        return app;
    }
}

module.exports = ShipmentServer;