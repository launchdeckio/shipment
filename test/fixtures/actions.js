module.exports = {

    toUpper({args}) {
        return args.message.toUpperCase();
    },

    customEvent({emit}) {
        emit({fooEvent: 'foobar'});
    },

    error() {
        throw new Error('something went wrong!');
    },
};