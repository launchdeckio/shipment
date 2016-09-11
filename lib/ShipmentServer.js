'use strict';

const _             = require('lodash');
const defaults      = require('defa');
const express       = require('express');
const bodyParser    = require('body-parser');
const child_process = require('child_process');
const objectHash    = require('object-hash');

class ShipmentServer {

    constructor(shipment, options) {
        options       = defaults(options, {
            port:     process.env.SHIPMENT_PORT,
            basePath: process.env.SHIPMENT_BASE_PATH,
            app:      () => this.makeApp()
        }, {
            port:     6565,
            basePath: '/'
        });
        this.shipment = shipment;
        if (!this.shipment.exportPath)
            throw new Error('The Shipment instance passed to ShipmentServer must provide an exportPath');
        this.app      = options.app;
        this.port     = options.port;
        this.basePath = options.basePath;
        this.addActions(shipment);
    }

    makeApp() {
        let app = express();
        app.use(bodyParser.json());
        return app;
    }

    addActions(shipment) {
        _.forEach(_.map(shipment.actions, Action => new Action), action => this.addAction(action));
    }

    getActionRoute(action) {
        return this.basePath + action.getName();
    }

    getWorkerPath() {
        return __dirname + '/shipmentWorker.js';
    }

    runAction(action, req, res) {
        res.writeHead(200, {
            'Content-Type':        'text/plain',
            'Content-Disposition': 'attachment'
        });
        let fork = child_process.fork(this.getWorkerPath(), {silent: true});
        fork.stdout.pipe(res);
        fork.stderr.pipe(res);
        fork.send({
            exportPath: this.shipment.exportPath,
            hash:       objectHash(this.shipment),
            action:     action.getName(),
            args:       req.body
        });
    }

    addAction(action) {
        this.app.post(this.getActionRoute(action), (req, res) => this.runAction(action, req, res));
    }

    serve() {
        console.log(`Shipment server listening on port ${this.port}`);
        return this.app.listen(this.port);
    }
}

module.exports = ShipmentServer;