# Datadog APM Helpers

A lightweight wrapper over Datadog's `dd-trace` library, adding utility functions to make it easier to trace, tag, and search for your functions.

## Motivation

`dd-trace` offers power and flexibility, but with that comes complexity. This wrapper adds helpers to simplify with:
- Tracing functions (including async)
- Tracing class methods
- Adding tags to the active span
- Adding tags to the *root* span (Required to enable filtering and searching in Trace Search and Analytics)
- Marking a span as an error without throwing

## Install

```sh
npm install --save @gamechanger/datadog-apm
```

or

```sh
yarn add @gamechanger/datadog-apm
```

## Decorators

Your observability code should stay out of the way of your business logic, and should be easy to add and remove. Decorators are a great way to accomplish that.

```TS
// Trace a function
@APM.trace()
async function foo() {}

// Trace *all* methods of a class
@APM.trace()
class GameChanger {
    public foo() {}
    private bar() {}
}

// Trace *individual* methods of a class
class GameChanger {
    @APM.trace()
    public foo() {}
    private bar() {}
}

// The decorator can be configured to override the defaults
class EmailQueue {
    @APM.trace({ serviceName: 'queue', spanName: 'queue.message' })
    public async pop() {}
}
```

## Tags

Adding tags happens throughout the code, and so ideally adds as few lines as possible.

With vanilla `dd-trace`, you must always check if the active span exists:
```JS
const span = tracer.scope().active();

if (span !== null) {
    span.addTags({
        'http.method': req.method
    });
}
```

This wrapper helps clean things up for you:
```TS
APM.addTags({ 'http.method': req.method })
```

## Root Span Access

If you're using `koa` or `express`, you can use `APM.getRootSpanFromContext` to get the root span.
This can be used to add tags to the root span, which are then accessible in the `Trace Search & Analytics` screens in datadog.

```TS
APM.addTags({ teamId: context.params.teamId }, APM.getRootSpanFromContext(context));
```

**NOTE: This uses undocumented properties and is not guaranteed to work.** However, if the underlying `dd-trace` code were to change, it will safely fall back to adding the tags to the current span rather than the root span.

## Marking Spans as Errors

```TS
APM.markAsError(new Error('I am not thrown'))
```