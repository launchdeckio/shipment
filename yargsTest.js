const yargs = require('yargs');

// const a = yargs
//
//     .command('do-sth', 'does something', yargs => {
//
//         // yargs.option('hi', 'ho');
//         console.log('builder invoked');
//
//         return yargs;
//
//     }, argv => {
//
//         console.log(argv);
//
//     })
//     .argv;

const parser = yargs
    .command('lunch-train <restaurant>', 'start lunch train', function () {}, function (argv) {
        console.log(argv.restaurant, argv.time)
    })
    .parse("lunch-train rudy's", {time: '12:15'});