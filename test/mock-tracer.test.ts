import { mockTracer } from '../src/mock-tracer';

describe('Mock tracer', () => {
    test('Mock property `isMock` is `true`', () => {
        expect(mockTracer.isMock).toBeTruthy();
    });

    test('Mock properties can be accessed at an arbitrary depth', () => {
        const accessTenDeep = (): any => (mockTracer as any).one.two.three.four.five.six.seven.eight.nine.ten;
        expect(accessTenDeep).not.toThrow();
    });

    test('Mock properties can be called at an arbitrary depth', () => {
        const callTenDeep = (): any => (mockTracer as any).one().two().three().four().five().six().seven().eight().nine().ten();
        expect(callTenDeep).not.toThrow();
    });

    test('Mock properties can be alternately called and accessed at an arbitrary depth', () => {
        const callAndAccessTenDeep = (): any => (mockTracer as any).one().two.three().four.five().six.seven().eight.nine().ten;
        expect(callAndAccessTenDeep).not.toThrow();
    });

    test('Mock wrap function returns the original function', () => {
        const identity = (...args: any[]): any[] => args;
        const wrapped = mockTracer.wrap('wrappedIdentity', identity);
        const args = [1, 2, 3, 'four', 'five'];
        expect(wrapped(...args)).toStrictEqual(identity(...args));
    });
});
