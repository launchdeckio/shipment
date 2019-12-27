const {http} = require('../index');

const actions = require('./actions');

http(actions).listen();

