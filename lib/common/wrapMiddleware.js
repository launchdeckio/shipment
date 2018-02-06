'use strict';

module.exports = (final, middleware) => {

    // Establish a "final" function in the middleware stack
    // this will be called at the "deepest" level and thus
    // should not refer to any "next" function
    let invokeNext = final;

    middleware.forEach(middleware => {

        // Iterate through the middleware stack,
        // each time wrapping the current value of "next"
        // within a new layer.
        let last   = invokeNext;
        invokeNext = (...args) => middleware(last, ...args);
    });

    // At the end of the loop, "next" will refer to the middleware
    // added last (which is the one "furthest" away from the "final"
    // function (the "deepest" level).

    return invokeNext;
};
