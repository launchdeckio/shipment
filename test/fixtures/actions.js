module.exports = {

    ['to-upper'](context) {
        // const message = context.args.message;
        // console.log(context.args.message.toUpperCase());
        return context.args.message.toUpperCase();
    },

    customEvent({emit}) {
        emit({fooEvent: 'foobar'});
    },

    error() {
        throw new Error('something went wrong!');
    },
};