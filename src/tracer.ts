import { Tracer, TracerOptions } from 'dd-trace';

let tracerOptions: TracerOptions;
export let datadogTracer: Tracer;
export const makeServiceName = (serviceName: string): string => `${tracerOptions.service}-${serviceName}`;

/**
 * This is a wrapper around the datadog init function.
 * This function should be imported and called before any other code,
 * otherwise the APM may not be able to trace it properly or at all.
 *
 * @param options The `TracerOptions` to be passed the tracer init function
 */
export const init = (options: TracerOptions): void => {
    tracerOptions = options;

    if (tracerOptions.enabled) {
        // This is imported here to avoid loading the datadog library at all when tracing is disabled.
        datadogTracer = require('dd-trace');
        datadogTracer.init(tracerOptions);
        console.log('DataDog APM Trace Running, with options: ', tracerOptions);
    } else {
        console.log(
            'DataDog APM Trace Disabled, using `ensureDatadogIsRunningHandler` to noop all functions in this file'
        );
    }
};
