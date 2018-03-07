const {cli} = require('../../');

const actions = require('./actions');

if (require.main === module) {
    cli(actions).exec();
} else {
    module.exports = options => cli(actions, options);
}