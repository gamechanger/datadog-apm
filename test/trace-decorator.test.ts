import { traceFunction } from '../src/trace-decorator';

describe('traceFunction', () => {
    test('traceFunction is a noop if the tracer is not inited', () => {
        const spy = jest.fn();
        const tracedSpy = traceFunction({})(spy);
        const args = [1, 2, 'three', 'four'];
        const returnValue = { five: 'five' };

        spy.mockReturnValue(returnValue);
        tracedSpy(...args);

        expect(spy.mock.calls).toEqual([args]);
        expect(spy.mock.results).toEqual([{ type: 'return', value: returnValue }]);
    });
});
