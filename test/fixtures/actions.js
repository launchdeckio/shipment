module.exports = {

    toUpper({args: {message = ''}}) {
        return message.toUpperCase();
    },

    customEvent({emit}) {
        emit({fooEvent: 'foobar'});
    },

    error() {
        throw new Error('something went wrong!');
    },
};