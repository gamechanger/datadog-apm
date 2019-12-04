/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Tracer } from 'dd-trace';

export const mockTracer = new Proxy({} as Tracer, {
    get<K extends keyof Tracer>(_target: Tracer, key: K) {
        console.warn(`Tried to access the DataDog tracer before the init function was called. Attempted to access property "${key}".`);

        if (key === 'scope') {
            return () => ({ active: () => {} });
        }

        if (
            key === 'startSpan' ||
            key === 'init' ||
            key === 'use'

        ) {
            return () => ({});
        }

        if (key === 'wrap') {
            return (_: any, f: any) => f;
        }

        if (
            key === 'extract' ||
            key === 'trace'
        ) {
            return () => null;
        }

        return undefined;
    },
});
