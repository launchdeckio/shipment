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
 * Expected request body payload: args
 * The verify key will be used in the output of the fork in formatting some lifecycle events
 * The client may use this key to verify that these lifecycle events are legitimate
 */
class ShipmentServer {

    /**
     * @param {Shipment} shipment
     * @param {String} basePath The base path to listen on
     * @param {Boolean} [output = true] Whether to pipe output from the worker process to standard streams
     * @param {http.Server} [app = null] Override server
     */
    constructor(shipment, {

        output = true,
        basePath = '',
        app = null,

    } = {}) {

        if (!app) app = ShipmentServer.makeApp();

        this.shipment = shipment;

        this.app      = app;
        this.basePath = basePath;
        this.output   = output;

        this.app.use(this.basePath, this.router());
    }

    addActionToRouter(router, action) {
        // Add both the "primitive" and the "non-primitive" routes
        [false, true].forEach(primitive => {
            const url     = this.getActionUrl(action, primitive);
            const handler = this.actionRoute(action, primitive);
            router.post(url, handler);
            router.get(url, handler);
        });
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
            this.addActionToRouter(router, action);
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

        const actions = Object.keys(this.shipment.actions);

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
     * @param {Boolean} [primitive = false] Output only the action result instead of the full log?
     * @returns {function}
     */
    actionRoute(action, primitive = false) {
        return async (req, res) => {
            try {
                await runActionViaApi({output: this.output}, action, req.body, res, primitive);
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
                console.warn(`Above error occurred in action "${action.name}"`); // eslint-disable-line no-console
            }
        };
    }

    /**
     * Get the route name (URL) for the given action
     * @param {Action} action
     * @param {Boolean} [primitive = false] Add the "primitive" prefix?
     * @returns {string}
     */
    getActionUrl(action, primitive = false) {
        return (primitive ? '/primitive/' : '/') + action.name;
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