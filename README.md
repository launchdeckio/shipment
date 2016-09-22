# shipment

> Provides basic functionality for exposing standardized DRY CLI, node module API, and HTTP API.

[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![Code Coverage][coveralls-image]][coveralls-url]
[![NPM Version][npm-image]][npm-url]

### Install

```bash
$ npm install shipment
```

### Usage

#### Define an action

```js
// actions/ToUpper.js

const BaseAction = require('shipment').Action;

module.exports = class ToUpper extends BaseAction {

    run(context, options) {
        var toUpperCase = options.message.toUpperCase();
        context.report('info', {result: toUpperCase});
        return toUpperCase;
    }

    parseArgs(args) {
        return {message: args.message};
    }
}
```

#### Expose a CLI, HTTP server or API!

```js
#!/usr/bin/env node
// my-module.js

const Shipment = require('shipment');

const shipment = new Shipment([
  require('./actions/ToUpper.js')
]);

// Expose a CLI
shipment.cli();
// $ my-module.js to-upper --message bar

// Or expose an HTTP server!
shipment.serve();
// $ curl -H "Content-Type: application/json" -X POST -d '{"message": "bar"}' http://localhost:6565/to-upper

// Or simply a Node.js module
module.exports = shipment.api();
// require('./my-module.js').toUpper({message: "bar"}).then(console.log);
```

Note: all output is printed through [pino](https://github.com/mcollina/pino) for now, the implementation of an output formatter is a [planned feature](https://github.com/launchdeckio/shipment/issues/7)

## License

MIT © [JM Versteeg](http://github.com/jmversteeg)

[![dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]

[travis-image]: https://img.shields.io/travis/launchdeckio/shipment.svg?style=flat-square
[travis-url]: https://travis-ci.org/launchdeckio/shipment

[codeclimate-image]: https://img.shields.io/codeclimate/github/launchdeckio/shipment.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/launchdeckio/shipment

[david-image]: https://img.shields.io/david/launchdeckio/shipment.svg?style=flat-square
[david-url]: https://david-dm.org/launchdeckio/shipment

[david-dev-image]: https://img.shields.io/david/dev/launchdeckio/shipment.svg?style=flat-square
[david-dev-url]: https://david-dm.org/launchdeckio/shipment#info=devDependencies

[coveralls-image]: https://img.shields.io/coveralls/launchdeckio/shipment.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/launchdeckio/shipment

[npm-image]: https://img.shields.io/npm/v/shipment.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/shipment
