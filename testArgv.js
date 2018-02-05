#!/usr/bin/env node

const {cli} = require('./');

const actions = require('./test/fixtures/actions');

const ar = cli(actions, {
    actions: {
        ['to-upper']: {
            description: 'cast sth to upper case',
            options:     {
                message: {
                    description: 'the text to convert to uppercase',
                    type:        'string',
                },
            },
        },
    },
}).exec();