import { Tracer, TracerOptions as DDTracerOptions } from 'dd-trace';
import { mockTracer } from './mock-tracer';

type TracerOptions = DDTracerOptions & { useMock?: boolean };
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
    tracerOptions = options as DDTracerOptions;

    if (options.useMock !== true) {
        tracer = require('dd-trace');
        tracer.isMock = false;
    }

    tracer.init(tracerOptions);
};

export {
    tracer,
    init,
    tracerOptions,
    TracerOptions,
}
