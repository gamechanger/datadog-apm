import { SpanOptions } from 'dd-trace';
import * as DDTags from 'dd-trace/ext/tags';

import * as Util from './util';
import { datadogTracer, makeServiceName } from './tracer';

type DDTag = typeof DDTags[keyof typeof DDTags];

type Tags = {
  [tag in DDTag]?: any;
} & {
  [key: string]: any;
};

interface Constructor {
  new (...args: any[]): any;
}

interface TraceConfig {
  className?: string;
  methodName?: string;
  serviceName?: string;
  spanName?: string;
  resourceName?: string;
  /** Cause the span to show up in trace search and analytics */
  makeSearchable?: boolean;
  tags?: Tags;
}

const traceFunction = (config: TraceConfig) => <F extends (...args: any[]) => any, P extends Parameters<F>, R extends ReturnType<F>>(target: F): F =>
    function wrapperFn(this: any, ...args: P): R {
        const {
            className,
            methodName = target.name,
            spanName = 'DEFAULT_SPAN_NAME',
            makeSearchable: useAnalytics,
            tags,
        } = config;
        const serviceName = config.serviceName
            ? makeServiceName(config.serviceName)
            : makeServiceName(spanName);
        const childOf = datadogTracer.scope().active() || undefined;
        const resourceName = config.resourceName
            ? config.resourceName
            : className
                ? `${className}.${methodName}`
                : methodName;
        const spanOptions: SpanOptions = {
            childOf,
            tags: {
                [DDTags.SERVICE_NAME]: serviceName,
                [DDTags.RESOURCE_NAME]: resourceName,
                ...tags,
            },
        };

        const span = datadogTracer.startSpan(spanName, spanOptions);

        if (!span) {
            return target.call(this, ...args);
        }

        if (useAnalytics) {
            span.setTag(DDTags.ANALYTICS, true);
        }

        // The callback fn needs to be wrapped in an arrow fn as the activate fn clobbers `this`
        return datadogTracer.scope().activate(span, () => {
            const output = target.call(this, ...args);

            if (output && typeof output.then === 'function') {
                output
                    .catch((error: Error) => {
                        Util.markAsError(error, span);
                    })
                    .finally(() => {
                        span.finish();
                    });
            } else {
                span.finish();
            }

            return output;
        });
    } as F;

const traceMethod = (config?: TraceConfig) =>
    function <R extends any, A extends any[], F extends (...args: A) => R>(
        target: any,
        _propertyKey: string,
        descriptor: PropertyDescriptor,
    ): TypedPropertyDescriptor<F> {
        const wrappedFn = descriptor.value;

        if (wrappedFn) {
            const className = target.name || target.constructor.name; // target.name is needed if the target is the constructor itself
            const methodName = wrappedFn.name;
            descriptor.value = traceFunction({ ...config, className, methodName })(wrappedFn);
        }

        return descriptor;
    }

const traceClass = (config?: TraceConfig) =>
    function <T extends Constructor>(
        constructor: T,
    ): void {
        const keys = Reflect.ownKeys(constructor.prototype);

        keys.forEach(key => {
            if (key === 'constructor') {
                return;
            }

            const descriptor = Object.getOwnPropertyDescriptor(
                constructor.prototype,
                key
            );

            // eslint-disable-next-line no-undef
            if (typeof key === 'string' && typeof descriptor?.value === 'function') {
                Object.defineProperty(
                    constructor.prototype,
                    key,
                    traceMethod(config)(constructor, key, descriptor),
                );
            }
        });
    }

/**
 * This decorator will cause the methods of a class, or an individual method, to be traced by the APM.
 *
 * @param config Optional configuration for the span that will be created for this trace.
 */
// Going to rely on inferrence do its thing for this function
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function trace(config?: TraceConfig) {
    function traceDecorator(target: Constructor): void;
    function traceDecorator<T>(
        target: Record<string, any>,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): void;
    function traceDecorator(a: Constructor | Record<string, any>, b?: any, c?: any): void {
        if (typeof a === 'function') {
            // Need to cast as there is no safe runtime way to check if a function is a constructor
            traceClass(config)(a as Constructor);
        } else {
            traceMethod(config)(a, b, c);
        }
    }

    return traceDecorator;
}
