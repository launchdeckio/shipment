# shipment

> Define-once, run-everywhere realtime operations framework

[![Build Status][travis-image]][travis-url]
[![NPM Version][npm-image]][npm-url]

### Install

```bash
$ npm install shipment@next
```

### Usage

```js
const Shipment = require('shipment');

const {Cli, HttpServer, ApiWrapper} = Shipment;

const shipment = new Shipment({
    toUpper({args: {message}}) {
        return message.toUpperCase();
    },
});

// Expose a CLI
new Cli(shipment.cli()).run();
// $ node ./my-module.js to-upper --message bar

// Or expose an HTTP server
new HttpServer(shipment).listen();
// $ curl -X POST -d '{"message": "bar"}' http://localhost:6565/to-upper

// Or simply a Node.js module
module.exports = new ApiWrapper(shipment).proxy;
// console.log(require('./my-module.js').toUpper({message: "bar"}));
```

## License

MIT © [sgtlambda](http://github.com/sgtlambda)

[![dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]

[travis-image]: https://img.shields.io/travis/launchdeckio/shipment.svg?style=flat-square
[travis-url]: https://travis-ci.org/launchdeckio/shipment

[david-image]: https://img.shields.io/david/launchdeckio/shipment.svg?style=flat-square
[david-url]: https://david-dm.org/launchdeckio/shipment

[david-dev-image]: https://img.shields.io/david/dev/launchdeckio/shipment.svg?style=flat-square
[david-dev-url]: https://david-dm.org/launchdeckio/shipment#info=devDependencies

[npm-image]: https://img.shields.io/npm/v/shipment.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/shipment
