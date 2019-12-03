import { Tracer, TracerOptions } from 'dd-trace';

let tracerOptions: TracerOptions = {};
let tracer: Tracer;

/**
 * This is a wrapper around the datadog init function.
 * This function should be imported and called before any other code,
 * otherwise the APM may not be able to trace it properly or at all.
 *
 * @param options The `TracerOptions` to be passed the tracer init function
 */
const init = (options: TracerOptions): void => {
    tracerOptions = options;
    tracer = require('dd-trace');
    tracer.init(tracerOptions);

    if (tracerOptions.enabled) {
        console.log('DataDog APM Trace Running, with options: ', tracerOptions);
    } else {
        console.log('DataDog APM Trace Disabled');
    }
};

export {
    tracer,
    init,
    tracerOptions,
    TracerOptions,
}
