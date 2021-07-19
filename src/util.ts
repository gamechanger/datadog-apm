import { Span } from 'dd-trace';
import * as Formats from 'dd-trace/ext/formats';

import { tracer } from './tracer';

type Nullable<T> = T | null;

type PrivateDatadogContext = {
    req: Record<string, any> & {
        _datadog?: {
            span?: Span
        }
    }
}

const getCurrentSpan = (): Nullable<Span> => tracer.scope().active();

/**
 * The root span is an undocumented internal property that DataDog adds to `context.req`.
 * The root span is required in order to add searchable tags.
 * Unfortunately, there is no API to access the root span directly.
 * See: node_modules/dd-trace/src/plugins/util/web.js
 *
 * @param context A Koa context object
 */
const getRootSpanFromRequestContext = (context: PrivateDatadogContext): Nullable<Span> => {
    // eslint-disable-next-line no-undef
    return context?.req?._datadog?.span ?? null;
};

/**
 * Add tags to a span to have more context about how and why it was running.
 * If added to the root span, tags are searchable and filterable.
 *
 * @param tags An object with the tags to add to the span
 * @param span An optional span object to add the tags to. If none provided, the current span will be used.
 */
const addTags = (tags: Record<string, any>, span?: Nullable<Span>): void => {
    const currentSpan = span || getCurrentSpan();

    if (!currentSpan) {
        return;
    }

    currentSpan.addTags(tags);
};

/**
 * If your logger cannot be automatically injected, you must manually inject the log message.
 * This function will mutate the metadata parameter to include IDs tieing it back to the APM span.
 * https://docs.datadoghq.com/tracing/advanced/connect_logs_and_traces/?tab=nodejs
 *
 * @param metadata The log metadata to augment
 * @param span An optional span object to add the tags to. If none provided, the current span will be used.
 */
const addLogMetadata = (metadata: Record<string, any>, span?: Span): void => {
    const currentSpan = span || getCurrentSpan();

    if (!currentSpan) {
        return;
    }

    tracer.inject(currentSpan.context(), Formats.LOG, metadata);
};

/**
 * Datadog will mark spans as errors if they throw an error.
 * This function will allow other spans to show up as errors as well.
 *
 * @param error An Error object.
 * @param span An optional span object to add the tags to. If none provided, the current span will be used.
 */
const markAsError = (error: Error, span?: Span): void => {
    addTags(
        {
            errorMessage: error.message,
            'error.type': error.name,
            'error.msg': error.message,
            'error.stack': error.stack
        },
        span
    );
};

export {
    Span,
    Formats,
    getRootSpanFromRequestContext,
    addTags,
    addLogMetadata,
    markAsError,
};
