import { Tracer, TracerOptions } from 'dd-trace';
import { mockTracer } from './mock-tracer';

let tracerOptions: TracerOptions = {};
let tracer: Tracer & { isMock?: boolean } = mockTracer;

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
    tracer.isMock = false;
};

export {
    tracer,
    init,
    tracerOptions,
    TracerOptions,
}
